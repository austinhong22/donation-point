package com.fairdonationpointpoc.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_event")
public class AuditEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_user_id")
    private User actorUser;

    @Column(name = "target_type", nullable = false, length = 50)
    private String targetType;

    @Column(name = "target_id", nullable = false)
    private Long targetId;

    @Column(nullable = false, length = 100)
    private String action;

    @Column(name = "event_data", nullable = false, length = 2000)
    private String eventData;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    protected AuditEvent() {
    }

    public AuditEvent(
        User actorUser,
        String targetType,
        Long targetId,
        String action,
        String eventData,
        LocalDateTime createdAt
    ) {
        this.actorUser = actorUser;
        this.targetType = targetType;
        this.targetId = targetId;
        this.action = action;
        this.eventData = eventData;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public User getActorUser() {
        return actorUser;
    }

    public String getTargetType() {
        return targetType;
    }

    public Long getTargetId() {
        return targetId;
    }

    public String getAction() {
        return action;
    }

    public String getEventData() {
        return eventData;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
