package com.groupe.gestion_clinic.notificationConfig;


import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.mail.javamail.MimeMessagePreparator;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendConfirmationEmail(String to, String subject, String content) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(content);
        mailSender.send(message);
    }

    public void sendReminderEmail(String to, String subject, String content) {
        MimeMessagePreparator messagePreparator = mimeMessage -> {
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(buildHtmlReminder(content), true);
        };
        mailSender.send(messagePreparator);
    }

    private String buildHtmlReminder(String content) {
        return "<html><body>" +
                "<h2>Rappel de Rendez-vous</h2>" +
                "<p>" + content + "</p>" +
                "</body></html>";
    }

    public void sendCancellationEmail(String email, String subject, String content) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject(subject);
        message.setText(content);
        mailSender.send(message);
    }

    public void sendPrescriptionEmail(String to, String patientName, String medicaments) {
        MimeMessagePreparator messagePreparator = mimeMessage -> {
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage);
            helper.setTo(to);
            helper.setSubject("Nouvelle prescription - " + patientName);
            helper.setText(buildPrescriptionHtml(patientName, medicaments), true);
        };
        mailSender.send(messagePreparator);
    }

    public void sendFactureEmail(String to, String numeroFacture, Double montant) {
        MimeMessagePreparator messagePreparator = mimeMessage -> {
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage);
            helper.setTo(to);
            helper.setSubject("Facture créée - " + numeroFacture);
            helper.setText(buildFactureHtml(numeroFacture, montant), true);
        };
        mailSender.send(messagePreparator);
    }

    private String buildPrescriptionHtml(String patientName, String medicaments) {
        return "<html><body>" +
                "<h2>Nouvelle Prescription</h2>" +
                "<p>Une nouvelle prescription a été créée pour le patient <strong>" + patientName + "</strong></p>" +
                "<p>Médicaments prescrits: " + medicaments + "</p>" +
                "</body></html>";
    }

    private String buildFactureHtml(String numeroFacture, Double montant) {
        return "<html><body>" +
                "<h2>Facture Créée</h2>" +
                "<p>Facture N° <strong>" + numeroFacture + "</strong></p>" +
                "<p>Montant: <strong>" + montant + " FCFA</strong></p>" +
                "</body></html>";
    }
}
