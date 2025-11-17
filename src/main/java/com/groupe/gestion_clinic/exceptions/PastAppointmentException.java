package com.groupe.gestion_clinic.exceptions;

public class PastAppointmentException extends RuntimeException {
    public PastAppointmentException(String message) {
        super(message);
    }
}
