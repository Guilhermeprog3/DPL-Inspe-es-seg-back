BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[User] (
    [id] NVARCHAR(450) NOT NULL,
    [nome] NVARCHAR(max) NOT NULL,
    [sobrenome] NVARCHAR(max) NOT NULL,
    [email] NVARCHAR(450) NOT NULL,
    [password] NVARCHAR(max) NOT NULL,
    [uf] NVARCHAR(max) NOT NULL,
    [regional] NVARCHAR(max) NOT NULL,
    [role] NVARCHAR(max) NOT NULL,
    [ativo] BIT NOT NULL CONSTRAINT [DF__User__ativo__5EBF139D] DEFAULT 1,
    [criadoEm] DATETIME2 NOT NULL CONSTRAINT [DF__User__criadoEm__5FB337D6] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [UQ__User__AB6E6164B6D39C13] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[PontoInstalacao] (
    [id] NVARCHAR(450) NOT NULL,
    [nome] NVARCHAR(max) NOT NULL,
    [uf] NVARCHAR(max) NOT NULL,
    [regional] NVARCHAR(max) NOT NULL,
    [base] NVARCHAR(max) NOT NULL,
    [qrCode] NVARCHAR(450) NOT NULL,
    [ativo] BIT NOT NULL CONSTRAINT [PontoInstalacao_ativo_df] DEFAULT 1,
    [equipamentoAtualId] NVARCHAR(450),
    CONSTRAINT [PontoInstalacao_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [PontoInstalacao_qrCode_key] UNIQUE NONCLUSTERED ([qrCode]),
    CONSTRAINT [PontoInstalacao_equipamentoAtualId_key] UNIQUE NONCLUSTERED ([equipamentoAtualId])
);

-- CreateTable
CREATE TABLE [dbo].[AcaoCorretiva] (
    [id] NVARCHAR(450) NOT NULL,
    [status] NVARCHAR(max) NOT NULL CONSTRAINT [AcaoCorretiva_status_df] DEFAULT 'Em Andamento',
    [dataVencimento] DATETIME2,
    [titulo] NVARCHAR(max) NOT NULL,
    [descricao] NVARCHAR(max) NOT NULL,
    [numNC] NVARCHAR(max),
    [nomeResponsavel] NVARCHAR(max) NOT NULL,
    [emailsCopia] NVARCHAR(max),
    [criadoEm] DATETIME2 NOT NULL CONSTRAINT [AcaoCorretiva_criadoEm_df] DEFAULT CURRENT_TIMESTAMP,
    [inspecaoId] NVARCHAR(450) NOT NULL,
    CONSTRAINT [AcaoCorretiva_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Equipamento] (
    [id] NVARCHAR(450) NOT NULL,
    [codigo] NVARCHAR(450) NOT NULL,
    [tipo] NVARCHAR(max) NOT NULL,
    [status] NVARCHAR(max) NOT NULL,
    [uf] NVARCHAR(max) NOT NULL,
    [nome] NVARCHAR(max),
    [extintorClasse] NVARCHAR(max),
    [extintorCarga] DECIMAL(8,2),
    [agente] NVARCHAR(max),
    [serieInmetro] NVARCHAR(450),
    [serieCilindro] NVARCHAR(450),
    [proximaRecarga] DATETIME2,
    [fabricante] NVARCHAR(max),
    [modelo] NVARCHAR(max),
    [capacidade] NVARCHAR(max),
    [dataFabricacao] DATETIME2,
    [ultimaRecarga] DATETIME2,
    [ultimaInspecao] DATETIME2,
    [proximaInspecao] DATETIME2,
    CONSTRAINT [Equipamento_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Equipamento_codigo_key] UNIQUE NONCLUSTERED ([codigo])
);

-- CreateTable
CREATE TABLE [dbo].[Inspecao] (
    [id] NVARCHAR(450) NOT NULL,
    [data] DATETIME2 NOT NULL CONSTRAINT [Inspecao_data_df] DEFAULT CURRENT_TIMESTAMP,
    [status] NVARCHAR(max) NOT NULL,
    [respostas] NVARCHAR(max) NOT NULL,
    [uf] NVARCHAR(max) NOT NULL,
    [regional] NVARCHAR(max) NOT NULL,
    [base] NVARCHAR(max) NOT NULL,
    [localNome] NVARCHAR(max) NOT NULL,
    [pontoId] NVARCHAR(450) NOT NULL,
    [equipamentoId] NVARCHAR(450) NOT NULL,
    [inspetorId] NVARCHAR(450) NOT NULL,
    CONSTRAINT [Inspecao_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Medida] (
    [id] NVARCHAR(450) NOT NULL,
    [data] DATETIME2 NOT NULL CONSTRAINT [DF__Medida__data__6D0D32F4] DEFAULT CURRENT_TIMESTAMP,
    [colaborador] NVARCHAR(max) NOT NULL,
    [matricula] NVARCHAR(max) NOT NULL,
    [supervisor] NVARCHAR(max) NOT NULL,
    [tipo] NVARCHAR(max) NOT NULL,
    [ocorrencia] NVARCHAR(max) NOT NULL,
    [medida] NVARCHAR(max) NOT NULL,
    [gravidade] NVARCHAR(max) NOT NULL,
    [classificacao] NVARCHAR(max) NOT NULL,
    [status] NVARCHAR(max) NOT NULL CONSTRAINT [DF__Medida__status__6E01572D] DEFAULT 'EM ANDAMENTO',
    [criadoPorId] NVARCHAR(450) NOT NULL,
    [numeroInspecao] NVARCHAR(max),
    [diasSuspensao] INT,
    [nomeSupervisor] NVARCHAR(max) NOT NULL,
    CONSTRAINT [Medida_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[taxa de contato] (
    [chave] INT NOT NULL,
    [chapa] NVARCHAR(1000),
    [nome] NVARCHAR(1000),
    [cpf] NVARCHAR(1000),
    [FUNCAO] NVARCHAR(1000),
    [secao] NVARCHAR(1000),
    [codsituacao] NVARCHAR(1000),
    [local] NVARCHAR(1000),
    [regional] NVARCHAR(1000),
    [area] NVARCHAR(1000),
    [equipe] NVARCHAR(1000),
    [supervisor] NVARCHAR(1000),
    [data] NVARCHAR(1000),
    [base] NVARCHAR(1000),
    [email] NVARCHAR(1000),
    [filial] NVARCHAR(1000),
    CONSTRAINT [taxa de contato_pkey] PRIMARY KEY CLUSTERED ([chave])
);

-- CreateTable
CREATE TABLE [dbo].[MedidaAnexo] (
    [id] NVARCHAR(450) NOT NULL,
    [url] NVARCHAR(max) NOT NULL,
    [nome] NVARCHAR(max) NOT NULL,
    [tipo] NVARCHAR(max) NOT NULL,
    [criadoEm] DATETIME2 NOT NULL CONSTRAINT [MedidaAnexo_criadoEm_df] DEFAULT CURRENT_TIMESTAMP,
    [medidaId] NVARCHAR(450) NOT NULL,
    CONSTRAINT [MedidaAnexo_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[PontoInstalacao] ADD CONSTRAINT [PontoInstalacao_equipamentoAtualId_fkey] FOREIGN KEY ([equipamentoAtualId]) REFERENCES [dbo].[Equipamento]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[AcaoCorretiva] ADD CONSTRAINT [AcaoCorretiva_inspecaoId_fkey] FOREIGN KEY ([inspecaoId]) REFERENCES [dbo].[Inspecao]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Inspecao] ADD CONSTRAINT [Inspecao_pontoId_fkey] FOREIGN KEY ([pontoId]) REFERENCES [dbo].[PontoInstalacao]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Inspecao] ADD CONSTRAINT [Inspecao_equipamentoId_fkey] FOREIGN KEY ([equipamentoId]) REFERENCES [dbo].[Equipamento]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Inspecao] ADD CONSTRAINT [Inspecao_inspetorId_fkey] FOREIGN KEY ([inspetorId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Medida] ADD CONSTRAINT [Medida_criadoPorId_fkey] FOREIGN KEY ([criadoPorId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[MedidaAnexo] ADD CONSTRAINT [MedidaAnexo_medidaId_fkey] FOREIGN KEY ([medidaId]) REFERENCES [dbo].[Medida]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
