# This is a sample Python script.

# Press Shift+F10 to execute it or replace it with your code.
# Press Double Shift to search everywhere for classes, files, tool windows, actions, and settings.
import requests
import json
import os

if __name__ == '__main__':
    for file in os.listdir("logs"):
        filename = "logs\\" + os.fsdecode(file)
        infile = open(filename, "r")
        js = infile.read()
        infile.close()
        GSFItem = json.loads(js)
        newpath = "output\\" + str(GSFItem['oid']['objectClass']) + "-" + str(GSFItem['oid']['type']) + "-" + str(GSFItem['oid']['server']) + "-" + str(GSFItem['oid']['num']) + " - " + GSFItem['avatar']['name'].strip('"')
        if not os.path.exists(newpath):
            os.makedirs(newpath)
        serverfile = open(newpath + "\\__GSFStoreItem.json", "w")
        serverfile.write(json.dumps(GSFItem, indent=4))
        serverfile.close()
        for _, array in GSFItem["assetMap"].items():
            for GSFAsset in array:
                r = requests.get("https://cdnproxy.webkinz.com/cdn/get/" + GSFAsset['cdnId'].strip('"'))
                if GSFAsset['assetTypeName'].strip('"') == "JSON":
                    ext = ".json"
                elif GSFAsset['assetTypeName'].strip('"') == "Image_PNG":
                    ext = ".png"
                else:
                    ext = ".cab"
                outfile = open(newpath + "\\" + GSFAsset['resName'].strip('"') + ext, "wb")
                outfile.write(r.content)
                outfile.close()

# See PyCharm help at https://www.jetbrains.com/help/pycharm/
