import pandas as pd
import numpy as np


# Arquivo DataSUS - Procedimento Ambulatoriais SC Long
df= pd.read_csv(r'C:\Users\bruno.haeming\Desktop\poc_painel_tijucas\data\raw\datasus - procedimento ambulatoriais sc long.csv', sep=';')
df.head()

df.to_excel(r'C:\Users\bruno.haeming\Desktop\poc_painel_tijucas\data\processed\procedimento_ambulatoriais_sc_long.xlsx', index=False)


df2 = pd.read_csv(r'C:\Users\bruno.haeming\Desktop\poc_painel_tijucas\data\raw\MIN.CIDADANIA - BOLSA FAMILIA SC (mensal).csv', sep=',', encoding='latin-1')  
df2.head()


