import base64, os

for file in os.listdir(f'{os.getcwd()}/Save'):
    if file.endswith(".txt"):
        with open(f'{os.getcwd()}/Save/{file}', 'r') as f:
            content = str(base64.b64decode(f.read()).decode())
            print(base64.b64decode(f.read()))
            f.close()
        with open(f'{os.getcwd()}/Save/{file}', 'w') as f2:
            f2.write(content)
            f2.close()
        os.rename(f'{os.getcwd()}/Save/{file}', f'{os.getcwd()}/Save/{file.split(".txt")[0]} (Decoded).json')
