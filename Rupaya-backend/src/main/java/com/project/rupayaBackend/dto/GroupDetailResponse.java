package com.project.rupayaBackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupDetailResponse {

    private UUID id;
    private String name;
    private String description;
    private UUID created_by;
    private Instant created_at;
    private long member_count;
    private double total_owed;
    private double total_owe;
    private List<GroupMembersResponse> members;

}
