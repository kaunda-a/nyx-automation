const winston = require('winston');
const path = require('path');
const config = require('./config');

// Custom log format
const logFormat = winston.format.combine(
    winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.prettyPrint()
);

// Console format for development
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({
        format: 'HH:mm:ss'
    }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let msg = `${timestamp} [${level}]: ${message}`;
        if (Object.keys(meta).length > 0) {
            msg += ` ${JSON.stringify(meta)}`;
        }
        return msg;
    })
);

// Create logger instance
const logger = winston.createLogger({
    level: config.logging.level,
    format: logFormat,
    defaultMeta: { service: 'nyx-automation' },
    transports: [
        // File transport for all logs
        new winston.transports.File({
            filename: path.join(config.logging.filePath, 'error.log'),
            level: 'error',
            maxsize: config.logging.maxSize,
            maxFiles: config.logging.maxFiles
        }),
        new winston.transports.File({
            filename: path.join(config.logging.filePath, 'combined.log'),
            maxsize: config.logging.maxSize,
            maxFiles: config.logging.maxFiles
        }),
        // Separate file for visit logs
        new winston.transports.File({
            filename: path.join(config.logging.filePath, 'visits.log'),
            level: 'info',
            maxsize: config.logging.maxSize,
            maxFiles: config.logging.maxFiles,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            )
        })
    ]
});

// Add console transport for development
if (config.server.nodeEnv !== 'production') {
    logger.add(new winston.transports.Console({
        format: consoleFormat
    }));
}

// Custom logging methods for specific events
logger.visitStart = (profileId, url, fingerprint) => {
    logger.info('Visit started', {
        event: 'visit_start',
        profileId,
        url,
        fingerprint: fingerprint?.id || 'unknown',
        timestamp: new Date().toISOString()
    });
};

logger.visitComplete = (profileId, url, duration, success, error = null) => {
    logger.info('Visit completed', {
        event: 'visit_complete',
        profileId,
        url,
        duration,
        success,
        error: error?.message || null,
        timestamp: new Date().toISOString()
    });
};

logger.visitError = (profileId, url, error, context = {}) => {
    logger.error('Visit failed', {
        event: 'visit_error',
        profileId,
        url,
        error: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString()
    });
};

logger.profileActivity = (profileId, action, details = {}) => {
    logger.info('Profile activity', {
        event: 'profile_activity',
        profileId,
        action,
        details,
        timestamp: new Date().toISOString()
    });
};

logger.systemHealth = (component, status, metrics = {}) => {
    logger.info('System health check', {
        event: 'system_health',
        component,
        status,
        metrics,
        timestamp: new Date().toISOString()
    });
};

logger.fingerprintGenerated = (fingerprintId, profileId, category) => {
    logger.info('Fingerprint generated', {
        event: 'fingerprint_generated',
        fingerprintId,
        profileId,
        category,
        timestamp: new Date().toISOString()
    });
};

logger.sessionStart = (sessionId, profileId, duration) => {
    logger.info('Session started', {
        event: 'session_start',
        sessionId,
        profileId,
        plannedDuration: duration,
        timestamp: new Date().toISOString()
    });
};

logger.sessionEnd = (sessionId, profileId, actualDuration, visitsCompleted) => {
    logger.info('Session ended', {
        event: 'session_end',
        sessionId,
        profileId,
        actualDuration,
        visitsCompleted,
        timestamp: new Date().toISOString()
    });
};

// Performance logging
logger.performance = (operation, duration, details = {}) => {
    logger.info('Performance metric', {
        event: 'performance',
        operation,
        duration,
        details,
        timestamp: new Date().toISOString()
    });
};

// Security logging
logger.security = (event, details = {}) => {
    logger.warn('Security event', {
        event: 'security',
        securityEvent: event,
        details,
        timestamp: new Date().toISOString()
    });
};

module.exports = logger;
