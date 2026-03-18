package com.fairdonationpointpoc.domain.repository;

import com.fairdonationpointpoc.domain.model.PartnerProduct;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PartnerProductRepository extends JpaRepository<PartnerProduct, Long> {

    List<PartnerProduct> findAllByActiveTrueOrderByIdAsc();
}
