package edu.cit.batawang.synchef.repository;

import edu.cit.batawang.synchef.model.Country;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CountryRepository extends JpaRepository<Country, Long> {
    Optional<Country> findByCode(String code);
    List<Country> findByContinent(String continent);
    Optional<Country> findByName(String name);
}
