package com.oppex.dto;

import com.oppex.entity.UserEntity;
import java.util.UUID;

public class UserResponse {

    public UUID id;
    public String email;
    public boolean isVerified;
    public String verificationToken; // For debugging - remove in production

    public UserResponse() {}

    public UserResponse(UUID id, String email, boolean isVerified, String verificationToken) {
        this.id = id;
        this.email = email;
        this.isVerified = isVerified;
        this.verificationToken = verificationToken;
    }

    public static UserResponse fromEntity(UserEntity entity) {
        return new UserResponse(entity.id, entity.email, entity.isVerified, entity.verificationToken);
    }
}
