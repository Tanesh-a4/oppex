package com.oppex.exception;

import com.oppex.dto.ApiResponse;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

@Provider
public class AuthExceptionMapper implements ExceptionMapper<AuthException> {

    @Override
    public Response toResponse(AuthException exception) {
        return Response.status(Response.Status.BAD_REQUEST)
                .entity(ApiResponse.error(exception.getMessage()))
                .build();
    }
}
