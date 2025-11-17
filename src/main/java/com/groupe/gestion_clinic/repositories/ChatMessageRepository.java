package com.groupe.gestion_clinic.repositories;

import com.groupe.gestion_clinic.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;


public interface ChatMessageRepository extends JpaRepository<ChatMessage,Integer> {


    /*
    * Cette requête est utilisée pour récupérer l’historique complet de la conversation entre deux utilisateurs spécifiques (par exemple un médecin et une secrétaire), dans l’ordre chronologique
    * */
    // Récupérer la conversation entre deux utilisateurs, triée par horodatage(ordre chronologique)
    @Query("SELECT cm FROM ChatMessage cm WHERE " +
            "(cm.sender.id = :user1Id AND cm.receiver.id = :user2Id) OR " +
            "(cm.sender.id = :user2Id AND cm.receiver.id = :user1Id) " +
            "ORDER BY cm.timestamp ASC")
    List<ChatMessage> findConversationBetweenUsers(@Param("user1Id") Integer user1Id, @Param("user2Id") Integer user2Id);

    /*
    * Quand le destinataire ouvre une conversation avec un expéditeur donné :
    *   Tous les messages reçus et non lus doivent être marqués comme lus.
    *   Au lieu de récupérer chaque message puis les modifier un par un en Java cette requête effectue une seule opération SQL (UPDATE en masse).
    * */
    //Cette requête sert à mettre à jour l’état des messages dans la base de données, pour indiquer qu’ils ont été lus par le destinataire.
    @Modifying
    @Query("UPDATE ChatMessage cm SET cm.isRead = TRUE WHERE cm.sender.id = :senderId AND cm.receiver.id = :receiverId AND cm.isRead = FALSE")
    void markMessagesAsRead(@Param("senderId") Integer senderId, @Param("receiverId") Integer receiverId);


    /*
    *
    * Quand l’utilisateur ouvre une conversation, il faut changer l’état des messages non lus en isRead = true.
    * Pour ça, on doit d’abord savoir lesquels sont non lus.
    * */
    // Trouver les messages non lus pour un utilisateur donné (quand il est le destinataire)
    List<ChatMessage> findByReceiverIdAndIsReadFalse(Integer receiverId);



    // le but est d;informer a un User combien de messages non lus il a reçus et qui les a envoyés
    // Compter les messages non lus pour un utilisateur donné par expéditeur
    @Query("SELECT cm.sender.id, COUNT(cm) FROM ChatMessage cm WHERE cm.receiver.id = :receiverId AND cm.isRead = FALSE GROUP BY cm.sender.id")
    List<Object[]> countUnreadMessagesBySender(@Param("receiverId") Integer receiverId);

}
