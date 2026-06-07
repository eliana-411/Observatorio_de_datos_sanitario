using System.Diagnostics;

namespace Observatorio.API.Services;

public class ETLJobService
{

    private readonly ILogger<ETLJobService>
        _logger;

    public ETLJobService(
        ILogger<ETLJobService> logger
    )
    {

        _logger = logger;

    }

    public async Task EjecutarETL()
    {

        try
        {

            _logger.LogInformation(
                "Iniciando ETL..."
            );

            var process =
                new Process();

            process.StartInfo =
                new ProcessStartInfo
                {

                    FileName = "python",

                    Arguments =
                    "../../ETL/main.py",

                    RedirectStandardOutput =
                        true,

                    RedirectStandardError =
                        true,

                    UseShellExecute =
                        false,

                    CreateNoWindow =
                        true

                };

            process.Start();

            string salida =

                await process
                .StandardOutput
                .ReadToEndAsync();

            string error =

                await process
                .StandardError
                .ReadToEndAsync();

            await process
                .WaitForExitAsync();

            _logger.LogInformation(
                salida
            );

            if(
                !string.IsNullOrWhiteSpace(
                    error
                )
            )
            {

                _logger.LogError(
                    error
                );

            }

            _logger.LogInformation(
                "ETL Finalizado"
            );

        }

        catch(Exception ex)
        {

            _logger.LogError(

                ex,

                "Error ejecutando ETL"

            );

            throw;

        }

    }

}