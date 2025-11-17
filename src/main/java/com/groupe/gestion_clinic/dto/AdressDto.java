package com.groupe.gestion_clinic.dto;


import com.groupe.gestion_clinic.model.Adresse;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdressDto {

    private String street ;

    private String houseNumber ;

    private Integer postalCode ;

    private String city ;

    private String country ;

    public static AdressDto fromEntity(Adresse adresse) {
        if (adresse == null) {
            return null;
        }
        return AdressDto
                .builder()
                .city(adresse.getCity())
                .country(adresse.getCountry())
                .houseNumber(adresse.getHouseNumber())
                .postalCode(adresse.getPostalCode())
                .street(adresse.getStreet())
                .build();
    }


    public static Adresse toDto(AdressDto adressDto) {
        if (adressDto == null) {
            return null;
        }
        return Adresse
                .builder()
                .city(adressDto.getCity())
                .country(adressDto.getCountry())
                .houseNumber(adressDto.getHouseNumber())
                .postalCode(adressDto.getPostalCode())
                .street(adressDto.getStreet())
                .build();
    }
}
