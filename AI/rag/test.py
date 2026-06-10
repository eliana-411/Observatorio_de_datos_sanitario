import pandas as pd, json, sys
df = pd.read_parquet("AI/data/vector_store.parquet")
print(f"Chunks indexados: {len(df)}")
for i, row in df.head(10).iterrows():
    meta = row.get("metadata", {})
    print(f"[{i}] {meta.get('source_file','?')} p.{meta.get('page','?')} | {str(row['document'])[:80]}...")
