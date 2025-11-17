package com.groupe.gestion_clinic.exceptions;

public class TooLateToCancelException extends RuntimeException {
    public TooLateToCancelException(String message) {
        super(message);
    }
}
