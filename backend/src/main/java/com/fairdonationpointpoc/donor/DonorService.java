package com.fairdonationpointpoc.donor;

import com.fairdonationpointpoc.actor.ActorAuthorizationService;
import com.fairdonationpointpoc.common.exception.AccessDeniedException;
import com.fairdonationpointpoc.common.exception.InvalidRequestException;
import com.fairdonationpointpoc.common.exception.ResourceNotFoundException;
import com.fairdonationpointpoc.common.model.Role;
import com.fairdonationpointpoc.domain.model.AuditEvent;
import com.fairdonationpointpoc.domain.model.Charity;
import com.fairdonationpointpoc.domain.model.DonationAllocation;
import com.fairdonationpointpoc.domain.model.DonationAllocationStatus;
import com.fairdonationpointpoc.domain.model.Payment;
import com.fairdonationpointpoc.domain.model.PaymentStatus;
import com.fairdonationpointpoc.domain.model.PointAccount;
import com.fairdonationpointpoc.domain.model.PointAccountOwnerType;
import com.fairdonationpointpoc.domain.model.PointAccountType;
import com.fairdonationpointpoc.domain.model.PointConversion;
import com.fairdonationpointpoc.domain.model.PointConversionStatus;
import com.fairdonationpointpoc.domain.model.PointLedgerEntry;
import com.fairdonationpointpoc.domain.model.PointLedgerEntryType;
import com.fairdonationpointpoc.domain.model.User;
import com.fairdonationpointpoc.domain.repository.AuditEventRepository;
import com.fairdonationpointpoc.domain.repository.CharityRepository;
import com.fairdonationpointpoc.domain.repository.DonationAllocationRepository;
import com.fairdonationpointpoc.domain.repository.PaymentRepository;
import com.fairdonationpointpoc.domain.repository.PointAccountRepository;
import com.fairdonationpointpoc.domain.repository.PointConversionRepository;
import com.fairdonationpointpoc.domain.repository.PointLedgerEntryRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DonorService {

    private final ActorAuthorizationService actorAuthorizationService;
    private final PaymentRepository paymentRepository;
    private final PointConversionRepository pointConversionRepository;
    private final CharityRepository charityRepository;
    private final DonationAllocationRepository donationAllocationRepository;
    private final PointAccountRepository pointAccountRepository;
    private final PointLedgerEntryRepository pointLedgerEntryRepository;
    private final AuditEventRepository auditEventRepository;

    public DonorService(
        ActorAuthorizationService actorAuthorizationService,
        PaymentRepository paymentRepository,
        PointConversionRepository pointConversionRepository,
        CharityRepository charityRepository,
        DonationAllocationRepository donationAllocationRepository,
        PointAccountRepository pointAccountRepository,
        PointLedgerEntryRepository pointLedgerEntryRepository,
        AuditEventRepository auditEventRepository
    ) {
        this.actorAuthorizationService = actorAuthorizationService;
        this.paymentRepository = paymentRepository;
        this.pointConversionRepository = pointConversionRepository;
        this.charityRepository = charityRepository;
        this.donationAllocationRepository = donationAllocationRepository;
        this.pointAccountRepository = pointAccountRepository;
        this.pointLedgerEntryRepository = pointLedgerEntryRepository;
        this.auditEventRepository = auditEventRepository;
    }

    @Transactional(readOnly = true)
    public DonorDashboardResponse getDashboard() {
        User donor = requireDonor();
        PointAccount donorWallet = requireDonorWallet(donor);
        List<Payment> payments = paymentRepository.findAllByDonorIdOrderByCreatedAtDesc(donor.getId());
        List<DonationAllocation> allocations = donationAllocationRepository.findAllByDonorIdOrderByCreatedAtDesc(donor.getId());

        return new DonorDashboardResponse(
            pointLedgerEntryRepository.sumBalanceByPointAccountId(donorWallet.getId()),
            pointConversionRepository.sumConvertedPointsByPointAccountId(donorWallet.getId()),
            allocations.stream().mapToLong(DonationAllocation::getAllocatedPoints).sum(),
            payments.stream().filter(payment -> payment.getStatus() == PaymentStatus.RECEIVED).count(),
            allocations.stream().filter(allocation -> allocation.getStatus() == DonationAllocationStatus.ACTIVE).count()
        );
    }

    @Transactional(readOnly = true)
    public List<DonorPaymentResponse> getPayments() {
        User donor = requireDonor();
        List<Payment> payments = paymentRepository.findAllByDonorIdOrderByCreatedAtDesc(donor.getId());
        Map<Long, PointConversion> conversionsByPaymentId = pointConversionRepository.findAllByPaymentIdIn(
            payments.stream().map(Payment::getId).toList()
        ).stream().collect(Collectors.toMap(conversion -> conversion.getPayment().getId(), Function.identity()));

        return payments.stream()
            .map(payment -> toPaymentResponse(payment, conversionsByPaymentId.get(payment.getId())))
            .toList();
    }

    @Transactional
    public DonorPaymentResponse createMockPayment(CreateMockPaymentRequest request) {
        User donor = requireDonor();
        LocalDateTime now = LocalDateTime.now();
        Payment payment = paymentRepository.save(new Payment(
            donor,
            generatePaymentRef(),
            request.amountKrw(),
            PaymentStatus.RECEIVED,
            now
        ));

        auditEventRepository.save(new AuditEvent(
            donor,
            "PAYMENT",
            payment.getId(),
            "PAYMENT_RECEIVED",
            "{\"amountKrw\":" + request.amountKrw() + "}",
            now
        ));

        return toPaymentResponse(payment, null);
    }

    @Transactional
    public DonorPaymentResponse convertPayment(Long paymentId) {
        User donor = requireDonor();
        PointAccount donorWallet = requireDonorWallet(donor);
        Payment payment = paymentRepository.findLockedById(paymentId)
            .orElseThrow(() -> new ResourceNotFoundException("Payment not found."));

        if (!payment.getDonor().getId().equals(donor.getId())) {
            throw new AccessDeniedException("Donor can only convert their own payments.");
        }
        if (payment.getStatus() != PaymentStatus.RECEIVED) {
            throw new InvalidRequestException("Payment is already converted.");
        }

        LocalDateTime now = LocalDateTime.now();
        long convertedPoints = payment.getAmountKrw();
        PointConversion conversion = pointConversionRepository.save(new PointConversion(
            payment,
            donorWallet,
            convertedPoints,
            PointConversionStatus.COMPLETED,
            now
        ));

        payment.markConverted();

        pointLedgerEntryRepository.save(new PointLedgerEntry(
            donorWallet,
            PointLedgerEntryType.CONVERSION_CREDIT,
            convertedPoints,
            "POINT_CONVERSION",
            conversion.getId(),
            "Points created from donor mock payment conversion.",
            now
        ));

        auditEventRepository.save(new AuditEvent(
            donor,
            "POINT_CONVERSION",
            conversion.getId(),
            "POINTS_CONVERTED",
            "{\"paymentId\":" + payment.getId() + ",\"convertedPoints\":" + convertedPoints + "}",
            now
        ));

        return toPaymentResponse(payment, conversion);
    }

    @Transactional(readOnly = true)
    public List<DonorAllocationResponse> getAllocations() {
        User donor = requireDonor();

        return donationAllocationRepository.findAllByDonorIdOrderByCreatedAtDesc(donor.getId()).stream()
            .map(this::toAllocationResponse)
            .toList();
    }

    @Transactional
    public DonorAllocationResponse createAllocation(CreateDonationAllocationRequest request) {
        User donor = requireDonor();
        PointAccount donorWallet = requireDonorWallet(donor);
        Charity charity = charityRepository.findById(request.charityId())
            .filter(Charity::isActive)
            .orElseThrow(() -> new ResourceNotFoundException("Charity not found."));
        PointAccount charityWallet = requireCharityWallet(charity);

        long currentBalance = pointLedgerEntryRepository.sumBalanceByPointAccountId(donorWallet.getId());
        if (request.points() > currentBalance) {
            throw new InvalidRequestException("Allocation points exceed donor balance.");
        }

        LocalDateTime now = LocalDateTime.now();
        DonationAllocation allocation = donationAllocationRepository.saveAndFlush(new DonationAllocation(
            donor,
            charity,
            donorWallet,
            charityWallet,
            request.points(),
            request.points(),
            DonationAllocationStatus.ACTIVE,
            now
        ));

        pointLedgerEntryRepository.save(new PointLedgerEntry(
            donorWallet,
            PointLedgerEntryType.ALLOCATION_DEBIT,
            -request.points(),
            "DONATION_ALLOCATION",
            allocation.getId(),
            "Donor allocated points to a charity.",
            now
        ));
        pointLedgerEntryRepository.save(new PointLedgerEntry(
            charityWallet,
            PointLedgerEntryType.ALLOCATION_CREDIT,
            request.points(),
            "DONATION_ALLOCATION",
            allocation.getId(),
            "Charity received donor allocation points.",
            now
        ));

        auditEventRepository.save(new AuditEvent(
            donor,
            "DONATION_ALLOCATION",
            allocation.getId(),
            "ALLOCATION_CREATED",
            "{\"charityId\":" + charity.getId() + ",\"allocatedPoints\":" + request.points() + "}",
            now
        ));

        return toAllocationResponse(allocation);
    }

    private User requireDonor() {
        return actorAuthorizationService.requireActor(Role.DONOR);
    }

    private PointAccount requireDonorWallet(User donor) {
        return pointAccountRepository.findByOwnerTypeAndOwnerReferenceIdAndAccountType(
            PointAccountOwnerType.USER,
            donor.getId(),
            PointAccountType.DONOR_WALLET
        ).orElseThrow(() -> new ResourceNotFoundException("Donor point account not found."));
    }

    private PointAccount requireCharityWallet(Charity charity) {
        return pointAccountRepository.findByOwnerTypeAndOwnerReferenceIdAndAccountType(
            PointAccountOwnerType.CHARITY,
            charity.getId(),
            PointAccountType.CHARITY_WALLET
        ).orElseThrow(() -> new ResourceNotFoundException("Charity point account not found."));
    }

    private String generatePaymentRef() {
        return "PAY-MOCK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private DonorPaymentResponse toPaymentResponse(Payment payment, PointConversion conversion) {
        return new DonorPaymentResponse(
            payment.getId(),
            payment.getExternalPaymentRef(),
            payment.getAmountKrw(),
            payment.getStatus().name(),
            conversion == null ? null : conversion.getConvertedPoints(),
            payment.getCreatedAt()
        );
    }

    private DonorAllocationResponse toAllocationResponse(DonationAllocation allocation) {
        return new DonorAllocationResponse(
            allocation.getId(),
            allocation.getCharity().getId(),
            allocation.getCharity().getName(),
            allocation.getAllocatedPoints(),
            allocation.getRemainingPoints(),
            allocation.getStatus().name(),
            allocation.getCreatedAt()
        );
    }
}
