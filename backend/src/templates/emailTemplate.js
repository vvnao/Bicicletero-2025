export function registrationEmailTemplate(name) {
    return `
    <div style="
        font-family: 'Nunito', sans-serif;
        background-color: #f4f7fb;
        padding: 30px;
        color: #333;
    ">
        <div style="
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            overflow: hidden;
        ">
            <!-- Encabezado -->
            <div style="
                background: linear-gradient(90deg, #0056b3, #007bff);
                color: white;
                padding: 20px 30px;
                display: flex;
                align-items: center;
                justify-content: space-between;
            ">
                <div>
                    <h2 style="
                        margin: 0;
                        font-family: 'Contrail One', cursive;
                    ">Bicicletero UBB</h2>
                </div>
                <div>
                    <img src="cid:logoBici" alt="Logo Bicicleta UBB" style="height: 60px;" />
                </div>
            </div>

            <!-- Cuerpo -->
            <div style="padding: 30px;">
                <p style="font-size: 16px;">Hola <b>${name}</b>,</p>
                <p style="font-size: 15px;">
                    Tu solicitud de registro en <b>Bicicletero UBB</b> fue recibida exitosamente y se encuentra 
                    <b>pendiente de aprobación</b>.
                </p>
                <p style="font-size: 15px;">
                    Recibirás una notificación por correo una vez que un guardia revise tu solicitud.
                </p>
            </div>

            <!-- Pie -->
            <div style="
                background-color: #f1f5f9;
                text-align: center;
                font-size: 13px;
                color: #555;
                padding: 15px;
                border-top: 1px solid #e0e6ed;
            ">
                <p>© ${new Date().getFullYear()} Bicicletero UBB — Universidad del Bío-Bío</p>
            </div>
        </div>
    </div>`;
}