const { connectDB, query } = require('./config/db');
const User = require('./models/User');

const run = async () => {
  try {
    // Inicializar conexión
    await connectDB();
    
    const email = 'admin@qrify.com';
    const password = 'adminpassword123';
    
    // Verificar si ya existe el usuario
    const existing = await User.findOne({ email });
    if (existing) {
      console.log(`El usuario administrador ya existe: ${email}`);
      // Asegurar que sea Premium con suscripción activa
      existing.role = 'admin';
      existing.subscription.status = 'active';
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 365); // Expira en 1 año
      existing.subscription.expiresAt = expiresAt;
      await existing.save();
      
      console.log('=============================================');
      console.log(' USUARIO ADMINISTRADOR ACTUALIZADO A ADMIN');
      console.log('=============================================');
      console.log(`Email:    ${email}`);
      console.log(`Password: [Sin cambios]`);
      console.log('Rol:      Admin (Acceso total al sistema y estadísticas)');
      console.log('=============================================');
      process.exit(0);
    }
    
    // Crear nuevo usuario básico
    const user = await User.create({
      name: 'Administrador QRify',
      email,
      password
    });
    
    // Subir privilegios a Admin activo
    user.role = 'admin';
    user.subscription.status = 'active';
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 365); // Expira en 1 año
    user.subscription.expiresAt = expiresAt;
    await user.save();
    
    console.log('\n=============================================');
    console.log(' USUARIO ADMINISTRADOR CREADO CON ÉXITO');
    console.log('=============================================');
    console.log(`Email:    ${email}`);
    console.log(`Password: ${password}`);
    console.log('Rol:      Admin (Acceso total al panel de campañas)');
    console.log('=============================================\n');
    
    process.exit(0);
  } catch (err) {
    console.error('Error al crear usuario administrador:', err);
    process.exit(1);
  }
};

run();
