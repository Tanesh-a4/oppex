package com.oppex.resource;

import com.oppex.dto.LoginRequest;
import com.oppex.dto.RegisterRequest;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.*;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@QuarkusTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class AuthResourceTest {

    private static final String TEST_EMAIL = "resource-test@example.com";
    private static final String TEST_PASSWORD = "SecurePassword123!";

    @BeforeEach
    @Transactional
    void setUp() {
        // Clean up test data using raw SQL
        com.oppex.entity.UserEntity.delete("email", TEST_EMAIL);
    }

    @Test
    @Order(1)
    @DisplayName("Health check should return 200")
    void testHealthCheck() {
        given()
            .when()
                .get("/api/users/health")
            .then()
                .statusCode(200)
                .body("success", is(true))
                .body("message", equalTo("Backend is healthy"));
    }

    @Test
    @Order(2)
    @DisplayName("Should register user via REST API")
    void testRegisterEndpoint() {
        RegisterRequest request = new RegisterRequest(TEST_EMAIL, TEST_PASSWORD);

        given()
            .contentType(ContentType.JSON)
            .body(request)
            .when()
                .post("/api/users/register")
            .then()
                .statusCode(201)
                .body("success", is(true))
                .body("message", equalTo("User registered successfully"))
                .body("data.email", equalTo(TEST_EMAIL.toLowerCase()))
                .body("data.isVerified", is(false))
                .body("data.id", notNullValue());
    }

    @Test
    @Order(3)
    @DisplayName("Should fail registration with invalid email")
    void testRegisterInvalidEmail() {
        RegisterRequest request = new RegisterRequest("invalid-email", TEST_PASSWORD);

        given()
            .contentType(ContentType.JSON)
            .body(request)
            .when()
                .post("/api/users/register")
            .then()
                .statusCode(400)
                .body("success", is(false));
    }

    @Test
    @Order(4)
    @DisplayName("Should fail registration with short password")
    void testRegisterShortPassword() {
        RegisterRequest request = new RegisterRequest(TEST_EMAIL, "short");

        given()
            .contentType(ContentType.JSON)
            .body(request)
            .when()
                .post("/api/users/register")
            .then()
                .statusCode(400)
                .body("success", is(false));
    }

    @Test
    @Order(5)
    @DisplayName("Should login via REST API")
    void testLoginEndpoint() {
        // Register first
        RegisterRequest registerRequest = new RegisterRequest(TEST_EMAIL, TEST_PASSWORD);
        given()
            .contentType(ContentType.JSON)
            .body(registerRequest)
            .when()
                .post("/api/users/register");

        // Login
        LoginRequest loginRequest = new LoginRequest(TEST_EMAIL, TEST_PASSWORD);
        given()
            .contentType(ContentType.JSON)
            .body(loginRequest)
            .when()
                .post("/api/users/login")
            .then()
                .statusCode(200)
                .body("success", is(true))
                .body("message", equalTo("Login successful"))
                .body("data.email", equalTo(TEST_EMAIL.toLowerCase()));
    }

    @Test
    @Order(6)
    @DisplayName("Should fail login with wrong credentials")
    void testLoginWrongCredentials() {
        LoginRequest loginRequest = new LoginRequest("nonexistent@example.com", "wrongpass");

        given()
            .contentType(ContentType.JSON)
            .body(loginRequest)
            .when()
                .post("/api/users/login")
            .then()
                .statusCode(400)
                .body("success", is(false))
                .body("message", equalTo("Invalid email or password"));
    }

    @Test
    @Order(7)
    @DisplayName("Should verify email via REST API")
    void testVerifyEmailEndpoint() {
        // Register first
        RegisterRequest registerRequest = new RegisterRequest(TEST_EMAIL, TEST_PASSWORD);
        given()
            .contentType(ContentType.JSON)
            .body(registerRequest)
            .when()
                .post("/api/users/register");

        // Get token
        String token = given()
            .when()
                .get("/api/users/token/" + TEST_EMAIL)
            .then()
                .statusCode(200)
                .extract()
                .path("data");

        // Verify
        given()
            .when()
                .get("/api/users/verify/" + token)
            .then()
                .statusCode(200)
                .body("success", is(true))
                .body("message", equalTo("Email verified successfully"))
                .body("data.isVerified", is(true));
    }

    @Test
    @Order(8)
    @DisplayName("Should return 404 for non-existent user")
    void testGetNonExistentUser() {
        given()
            .when()
                .get("/api/users/00000000-0000-0000-0000-000000000000")
            .then()
                .statusCode(404)
                .body("success", is(false))
                .body("message", equalTo("User not found"));
    }
}
