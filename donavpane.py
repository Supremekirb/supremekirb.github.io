import glob
import re

NAVPANE = """\
<div id="sidebar">
    <fieldset class="lilbox" style="flex-grow: 1;">
        <legend>Navigation</legend>
        <h3 class="ruletitle">
            <div class="ruletitletext">Pages</div>
            <div class="ruletitleline"></div>
        </h3>
        <ul>
            <li><a href="/index.html">Home</a></li>
            <li><a href="/projects.html">My stuff</a></li>
            <li><a href="/bit.html">My sona</a></li>
            <li><a href="/earthbound/dump.html">PK Hack dump</a></li>
            <li><a href="/tools/tools_home.html">Tools</a></li>
        </ul>

        <h3 class="ruletitle">
            <div class="ruletitletext">Cool people</div>
            <div class="ruletitleline"></div>
        </h3>
        
        <a class="t88x31" title="cyan!" href="https://cyan.pet/" target="_blank">
            <img width="88" height="31" src="https://chromonym.pages.gay/buttons/cyan.png" alt="cyan.pet button"/>
        </a>
        
        <a class="t88x31" title="gabbi!" href="https://www.youtube.com/channel/UCXDuYoKVMnHNL7oNHjqEoOg/videos" target="_blank">
            <img src="https://livvy94.neocities.org/images/buttons/gabbi.gif" alt="gabbi button">
        </a>

        <a class="t88x31" title="livvy!" href="https://livvy94.neocities.org/" target="_blank">
        <img width="88" height="31" src="https://livvy94.neocities.org/images/buttons/livvybutton.gif" alt="livvy94 button">
        </a>
        
        <a class="t88x31" title="PK Hack!" href="https://starmen.net/pkhack/" target="_blank">
        <img width="88" height="31" src="/images/88x31s/pkhack.gif" alt="PK Hack button">
        </a>
        
    </fieldset>
</div>
"""

FOOTER = """\
<img src="/images/gayass-derg/laptop.png" style="max-width: 100%;">
"""

def block_sub(text, magic1, magic2, block):
    indent = ""
    
    for i in text.split("\n"):
        if i.strip().startswith(magic1):
            indent = i.split(magic1)[0]
            break
    indented_block = indent + magic1 + "\n" + str().join((indent + l) for l in block.splitlines(keepends=True)) + indent + magic2
        
    text = "".join(text)

    return re.sub(f"(.+?{magic1}(.|\n)+?{magic2})", indented_block, text)
            

for i in glob.glob("**/*.html", root_dir=".", recursive=True):
    new = ""
    
    with open(i, "r") as file:
        new = file.read()
        print(f"Applying navbar to {i}")
        new = block_sub(new, "<!--NAVBAR START-->", "<!--NAVBAR END-->", NAVPANE)
        print(f"Applying footer to {i}")
        new = block_sub(new, "<!--FOOTER START-->", "<!--FOOTER END-->", FOOTER)
    
    with open(i, "w") as file:
        file.write(new)
    