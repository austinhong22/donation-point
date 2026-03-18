package com.fairdonationpointpoc.domain.repository;

import com.fairdonationpointpoc.domain.model.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

    @EntityGraph(attributePaths = "managedCharity")
    List<User> findAllByOrderByIdAsc();

    @EntityGraph(attributePaths = "managedCharity")
    Optional<User> findByIdAndActiveTrue(Long id);
}
