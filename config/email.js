/**
 * Configuración de email para PURO E-commerce
 */

const nodemailer = require('nodemailer');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

// Crear transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
});

// Verificar conexión (opcional, para desarrollo)
if (process.env.NODE_ENV === 'development') {
    transporter.verify((error, success) => {
        if (error) {
            console.error('❌ Error configurando email:', error.message);
        } else {
            console.log('✅ Servidor de email listo');
        }
    });
}

/**
 * Enviar email de recuperación de contraseña
 */
async function sendPasswordResetEmail(email, resetToken) {
    const resetUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;
    
    const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@puro.com',
        to: email,
        subject: 'Restablece tu contraseña - PURO Premium Natural Shots',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #7BB518; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0;">PURO</h1>
                    <p style="color: white; margin: 5px 0 0 0;">Premium Natural Shots</p>
                </div>
                <div style="padding: 30px; background-color: #f9f9f9; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #333;">Restablecer contraseña</h2>
                    <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en PURO.</p>
                    <p>Para continuar, haz clic en el siguiente botón:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="background-color: #7BB518; color: white; padding: 12px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block;">
                            Restablecer contraseña
                        </a>
                    </div>
                    <p>O copia y pega este enlace en tu navegador:</p>
                    <p style="background-color: #eee; padding: 10px; border-radius: 5px; word-break: break-all;">
                        ${resetUrl}
                    </p>
                    <p>Este enlace expirará en 1 hora.</p>
                    <p>Si no solicitaste restablecer tu contraseña, puedes ignorar este mensaje.</p>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                    <p style="color: #666; font-size: 14px;">
                        <strong>PURO Premium Natural Shots</strong><br>
                        Transforma tu bienestar naturalmente
                    </p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email de recuperación enviado a ${email}`);
        return true;
    } catch (error) {
        console.error('❌ Error enviando email:', error.message);
        return false;
    }
}

/**
 * Enviar email de confirmación de pedido
 */
async function sendOrderConfirmationEmail(email, order) {
    const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@puro.com',
        to: email,
        subject: `Confirmación de pedido #${order.id} - PURO`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #7BB518; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0;">¡Gracias por tu compra!</h1>
                    <p style="color: white; margin: 5px 0 0 0;">PURO Premium Natural Shots</p>
                </div>
                <div style="padding: 30px; background-color: #f9f9f9; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #333;">Pedido #${order.id}</h2>
                    <p>Tu pedido ha sido confirmado y está siendo procesado.</p>
                    
                    <div style="background-color: white; border: 1px solid #ddd; border-radius: 5px; padding: 20px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Resumen del pedido</h3>
                        <p><strong>Total:</strong> $${parseFloat(order.total_amount).toFixed(2)}</p>
                        <p><strong>Estado:</strong> ${order.status}</p>
                        <p><strong>Fecha:</strong> ${new Date(order.created_at).toLocaleDateString('es-ES')}</p>
                    </div>
                    
                    <p>Puedes ver el estado de tu pedido en cualquier momento desde tu cuenta.</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.BASE_URL || 'http://localhost:3000'}/orders/user" style="background-color: #7BB518; color: white; padding: 12px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block;">
                            Ver mis pedidos
                        </a>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                    <p style="color: #666; font-size: 14px;">
                        <strong>PURO Premium Natural Shots</strong><br>
                        Transforma tu bienestar naturalmente<br>
                        <a href="mailto:soporte@puro.com" style="color: #7BB518;">soporte@puro.com</a>
                    </p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email de confirmación enviado para pedido #${order.id}`);
        return true;
    } catch (error) {
        console.error('❌ Error enviando email de confirmación:', error.message);
        return false;
    }
}

module.exports = {
    transporter,
    sendPasswordResetEmail,
    sendOrderConfirmationEmail
};