package com.fairdonationpointpoc.domain.repository;

import com.fairdonationpointpoc.domain.model.Charity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CharityRepository extends JpaRepository<Charity, Long> {

    List<Charity> findAllByActiveTrueOrderByIdAsc();
}
