import os
from dotenv import load_dotenv
import psycopg2

# Cargar variables
load_dotenv()

DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")

# Conexión
def conectar():
    return psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )

# Insertar usuario
def insertar_usuario(nombre, email, password_hash):
    try:
        conn = conectar()
        cur = conn.cursor()

        cur.execute("""
            INSERT INTO usuarios (nombre, email, password_hash)
            VALUES (%s, %s, %s);
        """, (nombre, email, password_hash))

        conn.commit()
        print("✅ Usuario guardado en AWS")

    except Exception as e:
        print("❌ Error:", e)

    finally:
        cur.close()
        conn.close()



# 🚀 PRUEBA
if __name__ == "__main__":
    insertar_usuario("Juli", "Juli@test.com", "5963")