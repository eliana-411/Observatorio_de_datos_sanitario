namespace Observatorio.Application.Anomalias.DTOs;

/// <summary>
/// DTO para información del modelo de anomalías
/// </summary>
public class AnomaliaModelInfoDto
{
    public string Status { get; set; } = string.Empty;
    public ModelInfoDto ModelInfo { get; set; } = new();
    public PerformanceDto Performance { get; set; } = new();
    public ConfiabilidadDto Confiabilidad { get; set; } = new();
    public ValidacionCruzadaDto ValidacionCruzada { get; set; } = new();
    public TestDto Test { get; set; } = new();
}

public class ModelInfoDto
{
    public string Tipo { get; set; } = string.Empty;
    public string Version { get; set; } = string.Empty;
    public string Entrenado { get; set; } = string.Empty;
    public float Contamination { get; set; }
    public int NEstimators { get; set; }
    public int NFeatures { get; set; }
    public int TotalAnomalias { get; set; }
    public float PctAnomalias { get; set; }
}

public class PerformanceDto
{
    public float? Threshold { get; set; }
    public float ScoreMin { get; set; }
    public float ScoreMax { get; set; }
    public float ScoreMean { get; set; }
}

public class ConfiabilidadDto
{
    public float ReliabilityScore { get; set; }
    public float ReliabilityPct { get; set; }
    public float Separability { get; set; }
    public float StabilityCv { get; set; }
    public float Coverage { get; set; }
    public float MeanNormalScore { get; set; }
    public float MeanAnomalyScore { get; set; }
}

public class ValidacionCruzadaDto
{
    public List<FoldDto> Folds { get; set; } = new();
    public float Stability { get; set; }
    public float MeanPctAnomalies { get; set; }
    public float StdPctAnomalies { get; set; }
}

public class FoldDto
{
    public int Fold { get; set; }
    public int NTrain { get; set; }
    public int NVal { get; set; }
    public int NAnomalies { get; set; }
    public float PctAnomalies { get; set; }
    public float ScoreMin { get; set; }
    public float ScoreMax { get; set; }
    public float ScoreMean { get; set; }
    public float ScoreStd { get; set; }
}

public class TestDto
{
    public int NTest { get; set; }
    public int NAnomalies { get; set; }
    public float PctAnomalies { get; set; }
    public float MeanNormalScore { get; set; }
    public float MeanAnomalyScore { get; set; }
}