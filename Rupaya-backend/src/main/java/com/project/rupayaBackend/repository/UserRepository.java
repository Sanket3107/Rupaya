package com.project.rupayaBackend.repository;

import com.project.rupayaBackend.entity.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    @Query("""
        SELECT u
        FROM User u
        WHERE u.id <> :currentUserId
          AND (
               LOWER(u.name) LIKE LOWER(CONCAT('%', :q, '%'))
            OR LOWER(u.email) LIKE LOWER(CONCAT('%', :q, '%'))
          )
        """)
    List<User> searchByNameOrEmailExcludeSelf(
            @Param("q") String q,
            @Param("currentUserId") UUID currentUserId,
            Pageable pageable
    );

    boolean existsByEmail(String email);

    List<User> findByIdIn(List<UUID> ids);

}
