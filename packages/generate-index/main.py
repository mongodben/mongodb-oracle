import sys, os
from gpt_index import GPTSimpleVectorIndex
from dotenv import load_dotenv

load_dotenv()

index = GPTSimpleVectorIndex.load_from_disk('index.json')

should_continue = True

while should_continue:
  query = input("Ask me anything about Atlas App Services:\n")
  print('\nwait a bit. i\'m thinking really hard...')
  sys.stdout = open(os.devnull, "w") # suppress output to terminal
  res = index.query(query)
  sys.stdout = sys.__stdout__ # restore output to terminal

  print(res)
  print('\n\n')
  do_continue = input('Any other questions? Press <enter> to continue.')
  if do_continue == '':
    print('\n\n')
    continue
  else:
    print('Exiting application. Byeeeee! :)')
    should_continue = False
