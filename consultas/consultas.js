
const { Pool } = require('pg');

// Configuración de la conexión a la base de datos
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'bancosolar',
    password: 'josepedro2023',
    port: 5432
});

// Funcion para insertar registros en la tabla usuarios
async function agregar (nombre, balance) {
    console.log("Valores recibidos: " , nombre, balance);
    const result = await pool.query({ 
        text: 'INSERT INTO usuarios (nombre, balance) VALUES ($1, $2) RETURNING *',
        values: [nombre, balance]
    })
    console.log("Usuario agregado: " , result.rows[0]);
    //Respuesta de la funcion
    return result.rows[0];
};

//funcion para obtener todos los registros de la tabla usuarios
async function todos () {
    const result = await pool.query("SELECT * FROM usuarios");
    return result.rows;
}

//funcion para editar un registro de la tabla usuarios
async function editar (id, nombre, balance) {
    
    try {

        const queryEditar = {
            text: "UPDATE usuarios SET nombre = $1, balance = $2 WHERE id = $3 RETURNING *",
            values: [nombre, balance, id]
        }
        const result = await pool.query(queryEditar);
        return "Usuario editado correctamente";
    }

    catch (error) {
        console.log(error);
        return error;
    }
}

//funcion para eliminar un registro según su nombre recibido como un query.string
async function eliminar (id) {
    const result = await pool.query("DELETE FROM usuarios WHERE id = $1 RETURNING *", [id]);
    return result.rows[0];
}


async function obtenerSaldo(id) {
        const {rows} = await pool.query( 'SELECT balance FROM usuarios WHERE id = $1', [id]);
        return rows[0].balance;    
}

// Función para realizar una nueva transferencia entre usuarios
async function nuevaTransferencia(emisor, receptor, monto) {
    try {
        // Iniciar una transacción SQL
        await pool.query('BEGIN');

        // Verificar si el emisor tiene suficiente saldo para realizar la transferencia
        const saldoEmisor = await obtenerSaldo(emisor);
        if (saldoEmisor < monto) {
            // Si el emisor no tiene suficiente saldo, abortar la transacción y lanzar un error
            await pool.query('ROLLBACK');
            throw new Error("El emisor no tiene suficiente saldo para realizar la transferencia");
        }

        // Actualizar el balance del emisor
        await pool.query('UPDATE usuarios SET balance = balance - $1 WHERE id = $2', [monto, emisor]);

        // Actualizar el balance del receptor
        await pool.query('UPDATE usuarios SET balance = balance + $1 WHERE id = $2', [monto, receptor]);

        // Registrar la transferencia en la tabla transferencias
        const fecha = new Date();
        await pool.query('INSERT INTO transferencias (emisor, receptor, monto, fecha) VALUES ($1, $2, $3, $4)', [emisor, receptor, monto, fecha]);

        // Confirmar la transacción SQL
        await pool.query('COMMIT');

        return { mensaje: 'Transferencia realizada con éxito' };
    } catch (error) {
        // En caso de error, hacer rollback de la transacción SQL
        await pool.query('ROLLBACK');
        throw error;
    }
}

// Función para obtener todas las transferencias almacenadas en la base de datos en formato de arreglo
async function obtenerTransferencias() {
    try {
        // Consultar todas las transferencias y devolverlas en un arreglo
        const consulta = `
            SELECT t.fecha, t.monto, e.nombre AS emisor, r.nombre AS receptor 
            FROM transferencias t 
            INNER JOIN usuarios e ON t.emisor = e.id
            INNER JOIN usuarios r ON t.receptor = r.id;
        `;
        const result = await pool.query(consulta);
        return result.rows;
    } catch (error) {
        throw error;
    }
}


module.exports = { agregar, todos, editar, eliminar, nuevaTransferencia, obtenerTransferencias };





