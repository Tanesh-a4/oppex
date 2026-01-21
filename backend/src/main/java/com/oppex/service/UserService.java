package com.oppex.service;

import at.favre.lib.crypto.bcrypt.BCrypt;
import com.oppex.dto.LoginRequest;
import com.oppex.dto.RegisterRequest;
import com.oppex.dto.UserResponse;
import com.oppex.entity.UserEntity;
import com.oppex.exception.AuthException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class UserService {

    private static final int BCRYPT_COST = 12;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    /**
     * Register a new user with email and password.
     * Generates salt, hashes password with BCrypt, and creates verification token.
     */
    @Transactional
    public UserResponse registerUser(RegisterRequest request) {
        // Check if email already exists
        if (UserEntity.existsByEmail(request.email.toLowerCase())) {
            throw new AuthException("Email already registered");
        }

        // Generate salt
        String salt = generateSalt();

        // Hash password with salt using BCrypt
        String passwordHash = hashPassword(request.password, salt);

        // Generate verification token
        String verificationToken = generateVerificationToken();

        // Create and persist user
        UserEntity user = new UserEntity();
        user.email = request.email.toLowerCase();
        user.passwordHash = passwordHash;
        user.salt = salt;
        user.verificationToken = verificationToken;
        user.isVerified = false;

        user.persist();
        user.flush(); // Ensure data is written to DB immediately

        System.out.println("[DEBUG] User registered: " + user.email + ", token: " + user.verificationToken);

        return UserResponse.fromEntity(user);
    }

    /**
     * Authenticate user with email and password.
     * Returns user data if credentials are valid.
     */
    public UserResponse loginUser(LoginRequest request) {
        // Find user by email
        Optional<UserEntity> userOpt = UserEntity.findByEmail(request.email.toLowerCase());

        if (userOpt.isEmpty()) {
            throw new AuthException("Invalid email or password");
        }

        UserEntity user = userOpt.get();

        // Verify password
        if (!verifyPassword(request.password, user.salt, user.passwordHash)) {
            throw new AuthException("Invalid email or password");
        }

        return UserResponse.fromEntity(user);
    }

    /**
     * Verify user's email using the verification token.
     * This method is idempotent - calling it multiple times with the same token
     * will not cause errors (handles race conditions and React StrictMode).
     */
    @Transactional
    public UserResponse verifyEmail(String token) {
        System.out.println("[DEBUG] Attempting to verify token: " + token);
        
        Optional<UserEntity> userOpt = UserEntity.findByVerificationToken(token);

        if (userOpt.isEmpty()) {
            System.out.println("[DEBUG] Token not found in database");
            throw new AuthException("Invalid or expired verification token");
        }

        UserEntity user = userOpt.get();
        System.out.println("[DEBUG] Found user: " + user.email + ", isVerified: " + user.isVerified);

        // If already verified, just return success (idempotent behavior)
        if (user.isVerified) {
            System.out.println("[DEBUG] User already verified, returning success");
            return UserResponse.fromEntity(user);
        }

        // Mark as verified and clear token
        user.isVerified = true;
        user.verificationToken = null;
        user.persist();
        user.flush(); // Ensure immediate write
        
        System.out.println("[DEBUG] User verified successfully: " + user.email);

        return UserResponse.fromEntity(user);
    }

    /**
     * Get user by ID.
     */
    public Optional<UserResponse> getUserById(UUID userId) {
        UserEntity user = UserEntity.findById(userId);
        return user != null ? Optional.of(UserResponse.fromEntity(user)) : Optional.empty();
    }

    /**
     * Get verification token for a user (used by middleware to send emails).
     */
    public Optional<String> getVerificationToken(String email) {
        return UserEntity.findByEmail(email.toLowerCase())
                .map(user -> user.verificationToken);
    }

    // ============ Private Helper Methods ============

    private String generateSalt() {
        byte[] salt = new byte[16];
        SECURE_RANDOM.nextBytes(salt);
        return Base64.getEncoder().encodeToString(salt);
    }

    private String generateVerificationToken() {
        return UUID.randomUUID().toString();
    }

    private String hashPassword(String password, String salt) {
        // Combine password with salt before hashing
        String saltedPassword = password + salt;
        return BCrypt.withDefaults().hashToString(BCRYPT_COST, saltedPassword.toCharArray());
    }

    private boolean verifyPassword(String password, String salt, String storedHash) {
        String saltedPassword = password + salt;
        BCrypt.Result result = BCrypt.verifyer().verify(saltedPassword.toCharArray(), storedHash);
        return result.verified;
    }
}
