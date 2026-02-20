package com.project.rupayaBackend.repository;

import com.project.rupayaBackend.entity.BillShare;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface BillShareRepository extends JpaRepository<BillShare, UUID> {
}