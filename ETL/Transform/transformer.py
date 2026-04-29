import pandas as pd
from Transform.dim_persona import crear_dim_persona
from Transform.dim_tiempo import crear_dim_tiempo
from Transform.dim_lugar import crear_dim_lugar
from Transform.dim_metodo import crear_dim_metodo
from Transform.dim_atencion import crear_dim_atencion
from Transform.dim_contexto import crear_dim_contexto
from Transform.fact_evento import crear_fact_evento


def transformar_datos(df):
    """
    Ejecuta todas las transformaciones necesarias para crear las dimensiones
    y la tabla de hechos del modelo dimensional.
    
    Args:
        df: DataFrame validado y limpio
    
    Returns:
        dict: Diccionario con todas las dimensiones y la tabla de hechos
    """
    
    print("\n🔄 INICIANDO TRANSFORMACIONES...")
    
    # Crear dimensiones
    print("\n📊 Creando dimensiones...")
    
    dim_persona = crear_dim_persona(df)
    print(f"✓ Dimensión Persona: {len(dim_persona)} registros únicos")
    
    dim_tiempo = crear_dim_tiempo(df)
    print(f"✓ Dimensión Tiempo: {len(dim_tiempo)} registros únicos")
    
    dim_lugar = crear_dim_lugar(df)
    print(f"✓ Dimensión Lugar: {len(dim_lugar)} registros únicos")
    
    dim_metodo = crear_dim_metodo(df)
    print(f"✓ Dimensión Método: {len(dim_metodo)} registros únicos")
    
    dim_atencion = crear_dim_atencion(df)
    print(f"✓ Dimensión Atención: {len(dim_atencion)} registros únicos")
    
    dim_contexto = crear_dim_contexto(df)
    print(f"✓ Dimensión Contexto: {len(dim_contexto)} registros únicos")
    
    # Crear tabla de hechos
    print("\n📈 Creando tabla de hechos...")
    fact_evento = crear_fact_evento(df, dim_persona, dim_tiempo, dim_lugar, dim_metodo, dim_atencion, dim_contexto)
    print(f"✓ Tabla de Hechos: {len(fact_evento)} registros")
    
    print("\n✅ TRANSFORMACIONES COMPLETADAS\n")
    
    return {
        'dim_persona': dim_persona,
        'dim_tiempo': dim_tiempo,
        'dim_lugar': dim_lugar,
        'dim_metodo': dim_metodo,
        'dim_atencion': dim_atencion,
        'dim_contexto': dim_contexto,
        'fact_evento': fact_evento
    }
