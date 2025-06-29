import pandas as pd

#CSVを編集して新たに作成
def WordListSorter():
  wordlist = pd.read_csv("./wordlist.csv", header = None)
  
  if 'Unnamed: 0' in wordlist.columns:
    df_cleaned = wordlist.drop(columns=['Unnamed: 0'])
  elif '0' in wordlist.columns and not any(col.isalpha() for col in wordlist.columns if col != '0'): # 数字の列名で、他の列が全て英字でない場合など
    df_cleaned = wordlist.drop(columns=['0'])
  else:
    df_cleaned = wordlist # 削除する列がない場合
  
  wordlist = wordlist.drop_duplicates()
  
  # wordlist = wordlist[wordlist[1].str.len() <= 7]
  
  wordlist.to_csv("wordlist.csv", index = False, encoding = "utf-8")
  
  
  
WordListSorter()
