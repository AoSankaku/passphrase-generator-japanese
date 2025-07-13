import pandas as pd

#CSVを編集して更新
def WordListSorter():
  wordlist = pd.read_csv("./wordlist.csv", header = None)

  wordlist = wordlist.drop_duplicates()
  
  # wordlist = wordlist[wordlist[1].str.len() <= 7]
  
  wordlist.to_csv("wordlist.csv", header = None, index = False, encoding = "utf-8")
  
  
  
WordListSorter()
