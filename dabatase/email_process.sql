-- Eliminar la tabla (si existe)
DROP TABLE IF EXISTS recruitment_requirement CASCADE;

-- Crear la tabla con la nueva estructura usando ID alfanumérico
CREATE TABLE recruitment_requirement (
    id VARCHAR(36) PRIMARY KEY,  -- Cambiado a VARCHAR(16) para IDs como 'HvqJTQiHreyI70Kb'
    subject VARCHAR(255) NOT NULL,
    requirement_email VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    technical_skills TEXT[] NOT NULL,
    salary_min DECIMAL(10, 2) NOT NULL,
    salary_max DECIMAL(10, 2) NOT NULL,
    salary_currency CHAR(3) NOT NULL,
    date_receiver TIMESTAMP WITH TIME ZONE NOT NULL,
    web_link TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejorar el rendimiento de búsquedas comunes
CREATE INDEX idx_recruitment_email ON recruitment_requirement(requirement_email);
CREATE INDEX idx_recruitment_skills ON recruitment_requirement USING GIN(technical_skills);
CREATE INDEX idx_recruitment_date ON recruitment_requirement(date_receiver);

-- Comentarios para documentar la tabla
COMMENT ON TABLE recruitment_requirement IS 'Tabla para almacenar requisitos de reclutamiento';
COMMENT ON COLUMN recruitment_requirement.id IS 'Identificador único del requisito en formato alfanumérico (ejemplo: HvqJTQiHreyI70Kb)';
COMMENT ON COLUMN recruitment_requirement.subject IS 'Asunto o título del requisito';
COMMENT ON COLUMN recruitment_requirement.requirement_email IS 'Correo electrónico del participante';
COMMENT ON COLUMN recruitment_requirement.content IS 'Contenido detallado del requisito';
COMMENT ON COLUMN recruitment_requirement.technical_skills IS 'Array de habilidades técnicas requeridas';
COMMENT ON COLUMN recruitment_requirement.salary_min IS 'Salario mínimo ofrecido';
COMMENT ON COLUMN recruitment_requirement.salary_max IS 'Salario máximo ofrecido';
COMMENT ON COLUMN recruitment_requirement.salary_currency IS 'Moneda del salario (USD, EUR, etc.)';
COMMENT ON COLUMN recruitment_requirement.date_receiver IS 'Fecha y hora de recepción con zona horaria';
COMMENT ON COLUMN recruitment_requirement.web_link IS 'Enlace web al requisito original';

-- Eliminar la tabla si existe
DROP TABLE IF EXISTS email_processing_audit CASCADE;

-- Crear la tabla de auditoría de procesamiento de correos
CREATE TABLE email_processing_audit (
    id VARCHAR(36) PRIMARY KEY,               -- ID único en formato similar a 'HvqJTQiHreyI70Kb'
    message_id VARCHAR(255),                  -- ID único del mensaje (si está disponible en el correo)
    subject VARCHAR(255) NOT NULL,            -- Asunto del correo
    sender_name VARCHAR(100) NOT NULL,        -- Nombre del remitente
    sender_email VARCHAR(100) NOT NULL,       -- Email del remitente
    recipient_name VARCHAR(100) NOT NULL,     -- Nombre del destinatario principal
    recipient_email VARCHAR(100) NOT NULL,    -- Email del destinatario principal
    received_date TIMESTAMP WITH TIME ZONE NOT NULL, -- Fecha de recepción
    processing_status VARCHAR(50) DEFAULT 'PENDING', -- Estado: PENDING, PROCESSED, FAILED, IGNORED
    web_link TEXT,                            -- Link al correo original
    last_retry_date TIMESTAMP WITH TIME ZONE, -- Fecha del último intento
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_audit_status ON email_processing_audit(processing_status);
CREATE INDEX idx_audit_date ON email_processing_audit(received_date);
CREATE INDEX idx_audit_sender ON email_processing_audit(sender_email);
CREATE INDEX idx_audit_recipient ON email_processing_audit(recipient_email);

-- Comentarios para documentar la tabla
COMMENT ON TABLE email_processing_audit IS 'Tabla de auditoría para el seguimiento de correos procesados por el workflow de reclutamiento';
COMMENT ON COLUMN email_processing_audit.processing_status IS 'Estados posibles: PENDING (pendiente), PROCESSED (procesado correctamente), FAILED (falló el procesamiento), IGNORED (ignorado intencionalmente)';

-- Eliminar la tabla si existe
DROP TABLE IF EXISTS email_attachments CASCADE;

-- Crear la tabla para almacenar referencias a archivos en el sistema de archivos
CREATE TABLE email_attachments (
    id VARCHAR(36) PRIMARY KEY,                           -- ID único en formato similar a 'HvqJTQiHreyI70Kb'
    email_audit_id VARCHAR(36) NOT NULL,                  -- ID de referencia a la tabla email_processing_audit
    file_name VARCHAR(255) NOT NULL,                      -- Nombre del archivo (ej: "Perfil DevOPS v 1.0.docx")
    file_extension VARCHAR(20) NOT NULL,                  -- Extensión del archivo (ej: "docx")
    mime_type VARCHAR(255) NOT NULL,                      -- Tipo MIME
    file_size INTEGER NOT NULL,                           -- Tamaño en bytes
    file_path TEXT NOT NULL,                              -- Ruta completa al archivo en el sistema de archivos
    is_processed BOOLEAN DEFAULT FALSE,                   -- Indica si el adjunto ha sido procesado
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Restricción de clave foránea
    CONSTRAINT fk_email_audit 
        FOREIGN KEY (email_audit_id) 
        REFERENCES email_processing_audit(id)
        ON DELETE CASCADE
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_attachment_email_id ON email_attachments(email_audit_id);
CREATE INDEX idx_attachment_name ON email_attachments(file_name);
CREATE INDEX idx_attachment_extension ON email_attachments(file_extension);
CREATE INDEX idx_attachment_processed ON email_attachments(is_processed);

-- Comentarios para documentar la tabla
COMMENT ON TABLE email_attachments IS 'Tabla para almacenar referencias a archivos adjuntos en el sistema de archivos';
COMMENT ON COLUMN email_attachments.file_path IS 'Ruta completa al archivo en el sistema de archivos';

-- Eliminar la tabla si existe
DROP TABLE IF EXISTS linkedin_person CASCADE;

-- Crear la tabla para almacenar referencias a perfiles de linkedin
CREATE TABLE linkedin_person (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  linkedin VARCHAR(255),
  keywords TEXT[],
  description TEXT,
  text_filter TEXT,
  date_filter TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_title ON linkedin_person (title);
CREATE UNIQUE INDEX idx_linkedin ON linkedin_person (linkedin);