package com.oppex.resource;

import com.oppex.dto.*;
import com.oppex.service.UserService;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.UUID;

@Path("/api/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthResource {

    @Inject
    UserService userService;

    /**
     * Register a new user.
     * POST /api/users/register
     */
    @POST
    @Path("/register")
    public Response register(@Valid RegisterRequest request) {
        UserResponse user = userService.registerUser(request);
        return Response.status(Response.Status.CREATED)
                .entity(ApiResponse.success("User registered successfully", user))
                .build();
    }

    /**
     * Authenticate user.
     * POST /api/users/login
     */
    @POST
    @Path("/login")
    public Response login(@Valid LoginRequest request) {
        UserResponse user = userService.loginUser(request);
        return Response.ok(ApiResponse.success("Login successful", user)).build();
    }

    /**
     * Verify user's email.
     * GET /api/users/verify/{token}
     */
    @GET
    @Path("/verify/{token}")
    public Response verifyEmail(@PathParam("token") String token) {
        UserResponse user = userService.verifyEmail(token);
        return Response.ok(ApiResponse.success("Email verified successfully", user)).build();
    }

    /**
     * Get user by ID.
     * GET /api/users/{id}
     */
    @GET
    @Path("/{id}")
    public Response getUser(@PathParam("id") UUID id) {
        return userService.getUserById(id)
                .map(user -> Response.ok(ApiResponse.success(user)).build())
                .orElse(Response.status(Response.Status.NOT_FOUND)
                        .entity(ApiResponse.error("User not found"))
                        .build());
    }

    /**
     * Get verification token for email (internal use by middleware).
     * GET /api/users/token/{email}
     */
    @GET
    @Path("/token/{email}")
    public Response getVerificationToken(@PathParam("email") String email) {
        return userService.getVerificationToken(email)
                .map(token -> Response.ok(ApiResponse.success(token)).build())
                .orElse(Response.status(Response.Status.NOT_FOUND)
                        .entity(ApiResponse.error("Token not found"))
                        .build());
    }

    /**
     * Health check endpoint.
     * GET /api/users/health
     */
    @GET
    @Path("/health")
    public Response health() {
        return Response.ok(ApiResponse.success("Backend is healthy", null)).build();
    }
}
