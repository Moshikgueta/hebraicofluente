-- O idioma da conta (28/10/2026, site em inglês, PLANO-INGLES.md): o do site
-- em que ela foi criada. Os e-mails que saem do agendamento (lembretes,
-- vencimento, estorno) rodam no Worker brasileiro e leem daqui a língua e o
-- endereço dos links. Toda conta de antes é do site brasileiro: 'pt'.
ALTER TABLE accounts ADD COLUMN idioma TEXT NOT NULL DEFAULT 'pt';
