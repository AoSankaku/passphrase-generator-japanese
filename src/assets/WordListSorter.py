import pandas as pd

#CSVを編集して新たに作成
def WordListSorter():
  wordlist = pd.read_csv("./wordlist.csv", header = None)
  
  wordlist = wordlist.drop_duplicates()
  
  wordlist = wordlist[wordlist[1].str.len() <= 5]
  
  wordlist.to_csv("new_wordlist.csv", index = False, encoding = "utf-8")
  
WordListSorter()
