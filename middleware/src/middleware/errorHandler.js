export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Axios error from Quarkus backend
    if (err.response) {
        const status = err.response.status;
        const data = err.response.data;

        return res.status(status).json({
            success: false,
            message: data?.message || 'Backend service error',
        });
    }

    // Network error (Quarkus not reachable)
    if (err.code === 'ECONNREFUSED') {
        return res.status(503).json({
            success: false,
            message: 'Backend service unavailable',
        });
    }

    // Generic error
    return res.status(500).json({
        success: false,
        message: err.message || 'Internal server error',
    });
};
