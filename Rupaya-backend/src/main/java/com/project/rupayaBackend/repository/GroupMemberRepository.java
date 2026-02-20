package com.project.rupayaBackend.repository;

import com.project.rupayaBackend.entity.GroupMember;
import com.project.rupayaBackend.entity.enums.GroupRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GroupMemberRepository extends JpaRepository<GroupMember, UUID> {

    @Query("""
        SELECT COUNT(gm) 
        FROM GroupMember gm
        WHERE gm.groupId = :groupId
    """)
    long countActiveMembers(@Param("groupId") UUID groupId);

    @Query("""
        SELECT (COUNT(gm) > 0)
        FROM GroupMember gm
        WHERE gm.groupId = :groupId
          AND gm.userId = :userId
    """)
    boolean existsActiveByGroupIdAndUserId(@Param("groupId") UUID groupId, @Param("userId") UUID userId);

    long countByGroupId(UUID groupId);

    List<GroupMember> findByGroupId(UUID groupId);
    boolean existsByGroupIdAndUserIdAndRole(
            UUID groupId,
            UUID userId,
            GroupRole role
    );

    Optional<GroupMember> findByIdAndGroupId(UUID id, UUID groupId);
}
