
package com.example.SWPP.dto;

import com.example.SWPP.entity.UserProfile.Gender;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import java.time.LocalDate;

public class CreateUserProfileRequest {
    @NotNull
    @PastOrPresent
    private LocalDate dateOfBirth;

    private Gender gender;

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    public Gender getGender() { return gender; }
    public void setGender(Gender gender) { this.gender = gender; }
}
