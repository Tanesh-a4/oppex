package com.oppex.service;

import com.oppex.dto.LoginRequest;
import com.oppex.dto.RegisterRequest;
import com.oppex.dto.UserResponse;
import com.oppex.entity.UserEntity;
import com.oppex.exception.AuthException;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.*;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class UserServiceTest {

    @Inject
    UserService userService;

    private static final String TEST_EMAIL = "test@example.com";
    private static final String TEST_PASSWORD = "SecurePassword123!";

    @BeforeEach
    @Transactional
    void setUp() {
        // Clean up test data
        UserEntity.delete("email", TEST_EMAIL);
    }

    @Test
    @Order(1)
    @DisplayName("Should register a new user successfully")
    void testRegisterUser() {
        RegisterRequest request = new RegisterRequest(TEST_EMAIL, TEST_PASSWORD);

        UserResponse response = userService.registerUser(request);

        assertNotNull(response);
        assertNotNull(response.id);
        assertEquals(TEST_EMAIL.toLowerCase(), response.email);
        assertFalse(response.isVerified);
    }

    @Test
    @Order(2)
    @DisplayName("Should fail registration with duplicate email")
    void testRegisterDuplicateEmail() {
        RegisterRequest request = new RegisterRequest(TEST_EMAIL, TEST_PASSWORD);

        // First registration should succeed
        userService.registerUser(request);

        // Second registration should fail
        AuthException exception = assertThrows(AuthException.class, () -> {
            userService.registerUser(request);
        });

        assertEquals("Email already registered", exception.getMessage());
    }

    @Test
    @Order(3)
    @DisplayName("Should login successfully with valid credentials")
    void testLoginSuccess() {
        // Register first
        RegisterRequest registerRequest = new RegisterRequest(TEST_EMAIL, TEST_PASSWORD);
        userService.registerUser(registerRequest);

        // Login
        LoginRequest loginRequest = new LoginRequest(TEST_EMAIL, TEST_PASSWORD);
        UserResponse response = userService.loginUser(loginRequest);

        assertNotNull(response);
        assertEquals(TEST_EMAIL.toLowerCase(), response.email);
    }

    @Test
    @Order(4)
    @DisplayName("Should fail login with wrong password")
    void testLoginWrongPassword() {
        // Register first
        RegisterRequest registerRequest = new RegisterRequest(TEST_EMAIL, TEST_PASSWORD);
        userService.registerUser(registerRequest);

        // Try login with wrong password
        LoginRequest loginRequest = new LoginRequest(TEST_EMAIL, "WrongPassword123!");

        AuthException exception = assertThrows(AuthException.class, () -> {
            userService.loginUser(loginRequest);
        });

        assertEquals("Invalid email or password", exception.getMessage());
    }

    @Test
    @Order(5)
    @DisplayName("Should fail login with non-existent email")
    void testLoginNonExistentEmail() {
        LoginRequest loginRequest = new LoginRequest("nonexistent@example.com", TEST_PASSWORD);

        AuthException exception = assertThrows(AuthException.class, () -> {
            userService.loginUser(loginRequest);
        });

        assertEquals("Invalid email or password", exception.getMessage());
    }

    @Test
    @Order(6)
    @DisplayName("Should verify email successfully")
    void testVerifyEmail() {
        // Register first
        RegisterRequest registerRequest = new RegisterRequest(TEST_EMAIL, TEST_PASSWORD);
        UserResponse registeredUser = userService.registerUser(registerRequest);

        // Get verification token
        String token = userService.getVerificationToken(TEST_EMAIL).orElseThrow();

        // Verify email
        UserResponse verifiedUser = userService.verifyEmail(token);

        assertNotNull(verifiedUser);
        assertTrue(verifiedUser.isVerified);
        assertEquals(registeredUser.id, verifiedUser.id);
    }

    @Test
    @Order(7)
    @DisplayName("Should fail verification with invalid token")
    void testVerifyInvalidToken() {
        AuthException exception = assertThrows(AuthException.class, () -> {
            userService.verifyEmail("invalid-token");
        });

        assertEquals("Invalid or expired verification token", exception.getMessage());
    }

    @Test
    @Order(8)
    @DisplayName("Should get user by ID")
    void testGetUserById() {
        // Register first
        RegisterRequest registerRequest = new RegisterRequest(TEST_EMAIL, TEST_PASSWORD);
        UserResponse registeredUser = userService.registerUser(registerRequest);

        // Get user by ID
        var userOpt = userService.getUserById(registeredUser.id);

        assertTrue(userOpt.isPresent());
        assertEquals(TEST_EMAIL.toLowerCase(), userOpt.get().email);
    }

    @Test
    @Order(9)
    @DisplayName("Should handle case-insensitive email")
    void testCaseInsensitiveEmail() {
        // Register with lowercase
        RegisterRequest registerRequest = new RegisterRequest("Test@Example.COM", TEST_PASSWORD);
        userService.registerUser(registerRequest);

        // Login with different case
        LoginRequest loginRequest = new LoginRequest("test@example.com", TEST_PASSWORD);
        UserResponse response = userService.loginUser(loginRequest);

        assertNotNull(response);
        assertEquals("test@example.com", response.email);
    }
}
