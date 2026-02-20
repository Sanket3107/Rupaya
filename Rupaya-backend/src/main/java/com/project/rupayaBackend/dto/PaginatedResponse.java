package com.project.rupayaBackend.dto;

import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaginatedResponse<T> {

    private List<T> items;
    private long total;
    private int skip;
    private int limit;
    private boolean hasMore;
}

