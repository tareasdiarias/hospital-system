package com.example.hospitalsystem.repository;

import com.example.hospitalsystem.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(String name);  // ⭐ MÉTODO NECESARIO
    Boolean existsByName(String name);
}
