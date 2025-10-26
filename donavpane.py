import glob
import re

MAGIC1 = "<!--NAVBAR START-->"
MAGIC2 = "<!--NAVBAR END-->"

PATTERN = r"(.+?<!--NAVBAR START-->(.|\n)+?<!--NAVBAR END-->)"

NAVPANE = f"""\
{MAGIC1}
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
        
    </fieldset>
</div>
{MAGIC2}"""

for i in glob.glob("**/*.html", root_dir=".", recursive=True):
    print(f"Applying navbar to {i}")
    new = ""
    indent = ""
    
    with open(i, "r") as file:
        for j in file.readlines():
            if j.strip().startswith(MAGIC1):
                indent = j.split(MAGIC1)[0]
                break
        indented_navpane = str().join((indent + l) for l in NAVPANE.splitlines(keepends=True))
            
        file.seek(0)
        text = file.read()
        
        new = re.sub(PATTERN, indented_navpane, text)
    
    with open(i, "w") as file:
        file.write(new)
    