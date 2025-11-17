package com.groupe.gestion_clinic.handler;

import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    private String message;
    private Integer status;
    private Set<String> msgViolations = new HashSet<>();
}
