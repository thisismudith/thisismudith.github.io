var star, 
loadedRepos = 0, 
repos = [],
// appendRepos = [],
ids = [],
reviewed = 0,
stats = {
    "max": 0,
    "total": 0,
    "finished": 0,
    "under_dev": 0,
    "languages": []
}

async function requestUserRepos(){ // Load only 5 at once, if clicked load more, then load more.
    loadedRepos = 0;
    reviewed = 0;
    stats = {
        "max": 0,
        "total": 0,
        "finished": 0,
        "under_dev": 0,
        "languages": []
    }
    document.querySelector('.sync p').innerText = 'Syncing...'
    repos = []
    document.querySelector('.loading').style.display = 'inline-block';
    document.querySelector('.loadMore').style.display = 'none';
    var stargazers = {}, user = "thisismudith";
    await fetch(`https://api.github.com/users/${user}/repos`, {
        method: "GET",
        headers: {
            Authorization: "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yX3PYF7YQZIzMzguH2l"
        }
    }).then(res => res.json()).then(data => {
        if (data.length){
            stats.max = data.length
            for (let i in data){
                exists = loadRepo(user, data[i])
                stargazers[data[i].name] =  data[i].stargazers_count
            }
            star = Object.keys(stargazers).reduce((a, b) => stargazers[a] > stargazers[b] ? a : b)
            set('syncTime', new Date().getTime())
        }else{
            // data = WHOA // TO be deleted
            // stats.max = data.length // TO be deleted
            // for (let i in data){ // TO be deleted
            //     exists = loadRepo(user, data[i]) // TO be deleted
            //     stargazers[data[i].name] =  data[i].stargazers_count // TO be deleted
            // } // TO be deleted
            // star = Object.keys(stargazers).reduce((a, b) => stargazers[a] > stargazers[b] ? a : b) // TO be deleted
            notification('<i class="fa-regular fa-circle-xmark"></i>', 'We are being rate limited by the GitHub API. Please try again later.', 'var(--red)', "white", 5000)
            document.querySelector('.loading').style.display = 'none';
        }
    })
}

async function loadRepo(user, data){
    // var languages = await fetch(data.languages_url, {
    //     headers: {
    //         Authorization: "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yX3PYF7YQZIzMzguH2l"
    //     }
    // }).then(res => {
    //     return (res.ok) ? res.json() : {}
    // }).then(data => Object.keys(data))
    await fetch(`https://raw.githubusercontent.com/${user}/${data.name}/main/web-preview/manifest.json`).then(res => {
        var id = repos.map(repo => repo.id)
        reviewed ++;
        if (!id.includes(data.id)){
            if (res.ok){
                stats.total ++;
                description = res.json().then(manifest => {
                    console.log(manifest)
                    if (manifest.status) stats.finished += 1
                    else stats.under_dev += 1
                    repos.push({
                        "name": data.name, 
                        "id": data.id,
                        "description": manifest.description,
                        "languages": manifest.languages,
                        "url": data.html_url,
                        "image": (manifest.hasOwnProperty("image")) ? manifest.image : "assets/images/default.png",
                        "time": data.updated_at,
                        'link': manifest.link,
                        'href': manifest.href,
                        'status': manifest.status   
                    })
                    console.log(repos)
                    for (let lang of ["HTML", "CSS", "JS", "JS Framework"]){
                        if (!stats.languages.includes(lang)) stats.languages.push(lang)
                    }
                })
            }
        }
    })
    if (reviewed == stats.max) sortRepos()
    // if (repos.length + 1 == stats.total) requestUserRepos()
}

function sortRepos(ascending=true){
    repos = [...new Set(repos)]
    console.log(repos)
    repos = repos.sort((a, b) => (ascending) ? (b.time - a.time):(a.time - b.time))
    repos.map(repo => {
        if (ids.includes(repo.id)) repos.splice(repos.indexOf(repo), 1)
        else{
            if (repo.name == star){repo.stars = true;repos.splice(repos.indexOf(repo), 1);repos.unshift(repo)}
            ids.push(repo)
        }
    })
    set('syncRepos', repos)
    set('stats', stats)
    loadRepos()
}

async function loadRepos(load=false){
    if (load){
        document.querySelector('.loadMore').style.display = 'none';
        document.querySelector('.loading').style.display = 'inline-block';
        setTimeout(()=>{document.querySelector('.loading').style.display = 'none';}, 2000)
    }
    else{
        document.querySelector('#totalP #num').innerText = (stats.total > 0) ? stats.total : '-'
        document.querySelector('#finished #num').innerText = (stats.finished > 0) ? stats.finished : '-'
        document.querySelector('#under-dev #num').innerText = (stats.under_dev > 0) ? stats.under_dev : '-'
        document.querySelector('#languages #num').innerText = (stats.languages.length > 0) ? stats.languages.length : '-'
        document.querySelector('.loading').style.display = 'none';
        document.querySelector('.sync p').innerText = (get('syncTime') == 0) ? 'Not synced yet':`Last synced ${(relativeTime(new Date(get('syncTime')), new Date())) ? relativeTime(new Date(get('syncTime')), new Date()):'just now'}`
        if (get('syncRepos').length > 0) document.querySelector('.loadMore').style.display = 'block';
        if (get('syncTime') != 0){
        setInterval(() => document.querySelector('.sync p').innerText = `Last synced ${(relativeTime(new Date(get('syncTime')), new Date())) ? relativeTime(new Date(get('syncTime')), new Date()):'just now'}`)
        }
    }
    var res = repos.slice(0, 5)
    console.log(res)
    var appendRepos = []
    setTimeout(()=>{
        res.forEach(repo => {
            if (!document.getElementById(repo.id)){
                var time = new Date(repo.time)
                var languages = []
                if (repo.languages) for (lang of repo.languages){
                  if (['html', 'css', 'javascript', 'jquery', 'python', ,'json', 'numpy', 'pandas', 'git', 'mongo db', 'windows terminal', 'kali'].includes(lang.toString().toLowerCase())) languages.push(`<li class="lang langLabel"><img src="assets/images/langs/${lang.toString().toLowerCase().replace('windows terminal', 'cmd').replace('mongo db', 'mongo-db')}.svg"></li>`)
                  else languages.push(`<li class="lang langLabel" style="background-color: var(--bg-${lang.toString().toLowerCase().replace('++','pp').replace('#', 'sharp')});"><span>${lang}</span></li>`)
                }
                document.querySelector('.repos').innerHTML += `
                <div class="repo" id="${repo.id}" animation="popUp .8s forwards" exec="sidebarScroll(1)">
                    ${(repo.stars) ? '<div class="tag"><span data-tooltip="Most Stars!" data-tooltip-right><i class="fa-solid fa-star"></i></span></div>':''}
                    ${(repo.status) ? '':'<div class="tag under-dev"><span data-tooltip="This repository is under development." data-tooltip-right><i class="fa-solid fa-clock"></i></span></div>'}
                    <img src="${repo.image}" alt="${repo.name}">
                    <div class="repo-content">
                        <h1>${repo.name}</h1>
                        <p>${repo.description}</p>
                        <div class="flex-row">
                            <div class="link">
                                <a href="${repo.link}" target="_blank"><i class="fa-solid fa-link"></i> <span>${repo.href}</span></a>
                            </div>
                            <div class="time">
                            <span data-tooltip="${time.format("d mmmm, yyyy at HH:MM")}" data-tooltip-center><i class="fa-solid fa-clock-three"></i>&nbsp;&nbsp;${relativeTime(new Date(repo.time), new Date())}</span>
                            </div>
                        </div>
                        <hr>
                        <ul>${languages.join('')}
                        </ul>
                    </div>
                </div>`
                appendRepos.push(repo.id)
            }
        })
        appendRepos.forEach(id => observer.observe(document.getElementById(id)))
        document.querySelectorAll('.repo').forEach(repo => {
            if (!load) cropText((window.innerWidth > 600) ? 245:600, repo, repo.querySelector('p'))
        })
    }, (load) ? 2000:0)
    document.querySelector('.sync i').classList.remove('fa-spin')
    repos = repos.slice(5)
    if (repos.length == 0) document.querySelector('.loadMore').style.display = 'none';
}

function relativeTime(start, end){
    var diff = (end.getTime() - start.getTime())/1000
    relative = [
        {"unit": "year", "diff": 31536000}, 
        {"unit": "month", "diff": 2628000}, 
        {"unit": "week", "diff": 604800}, 
        {"unit": "day", "diff": 86400}, 
        {"unit": "hour", "diff": 3600},
        {"unit": "minute", "diff": 60},
        {"unit": "second", "diff": 1}
    ]
    for (let unit of relative){
        if (diff >= unit.diff) return `${Math.floor(diff/unit.diff)} ${unit.unit}${(Math.floor(diff/unit.diff) > 1) ? 's':''} ago`    
    }
}


async function syncRepos(forceContinue=false){
    if (new Date().getTime() - get('syncTime') >= 300000 || forceContinue){
        setTimeout(()=>{
            if (get('syncRepos').length == 0){
                document.getElementById('slow-loading').style.display = 'block';
                document.querySelector('.loadMore').style.display = 'none';
                // set('syncTime', 0)
            }else if (!document.querySelector('.repo')){
                document.getElementById('slow-loading').style.display = 'block';
                document.querySelector('.loadMore').style.display = 'none';
                // set('syncTime', 0)
            }
        }, 1000)
        document.querySelector('.loadMore').style.display = 'none';
        document.querySelector('.loading').style.display = 'inline-block';
        setTimeout(()=>{document.querySelector('.loading').style.display = 'none';}, 2000)
        document.querySelector('.sync p').style.innerHTML = 'Loading...'
        document.querySelector('.sync').querySelector('i').classList.add('fa-spin')
        document.querySelectorAll('.repo').forEach(repo => repo.remove())
        if (forceContinue){
            loadedRepos = get('syncRepos').length
            loadRepos();
        }
        else await requestUserRepos();
        sortRepos();
    }else notification('<i class="fa-regular fa-circle-exclamation"></i>', 'You can only sync once every 5 minutes.', 'var(--blue)')
}

// alert('Add last updated copy of website from GitHub for slow-loading internet connections. Add connect online option!')

// Show website updated every 3 hours
const WHOA = [
    {
      "id": 512495252,
      "node_id": "R_kgDOHowOlA",
      "name": "Advent-Calendar",
      "full_name": "thisismudith/Advent-Calendar",
      "private": false,
      "owner": {
        "login": "thisismudith",
        "id": 72611306,
        "node_id": "MDQ6VXNlcjcyNjExMzA2",
        "avatar_url": "https://avatars.githubusercontent.com/u/72611306?v=4",
        "gravatar_id": "",
        "url": "https://api.github.com/users/thisismudith",
        "html_url": "https://github.com/thisismudith",
        "followers_url": "https://api.github.com/users/thisismudith/followers",
        "following_url": "https://api.github.com/users/thisismudith/following{/other_user}",
        "gists_url": "https://api.github.com/users/thisismudith/gists{/gist_id}",
        "starred_url": "https://api.github.com/users/thisismudith/starred{/owner}{/repo}",
        "subscriptions_url": "https://api.github.com/users/thisismudith/subscriptions",
        "organizations_url": "https://api.github.com/users/thisismudith/orgs",
        "repos_url": "https://api.github.com/users/thisismudith/repos",
        "events_url": "https://api.github.com/users/thisismudith/events{/privacy}",
        "received_events_url": "https://api.github.com/users/thisismudith/received_events",
        "type": "User",
        "site_admin": false
      },
      "html_url": "https://github.com/thisismudith/Advent-Calendar",
      "description": "This is the advent calendar of all the years possible mostly starting from 2015. Yes, it takes time but I'm working on it all :)",
      "fork": false,
      "url": "https://api.github.com/repos/thisismudith/Advent-Calendar",
      "forks_url": "https://api.github.com/repos/thisismudith/Advent-Calendar/forks",
      "keys_url": "https://api.github.com/repos/thisismudith/Advent-Calendar/keys{/key_id}",
      "collaborators_url": "https://api.github.com/repos/thisismudith/Advent-Calendar/collaborators{/collaborator}",
      "teams_url": "https://api.github.com/repos/thisismudith/Advent-Calendar/teams",
      "hooks_url": "https://api.github.com/repos/thisismudith/Advent-Calendar/hooks",
      "issue_events_url": "https://api.github.com/repos/thisismudith/Advent-Calendar/issues/events{/number}",
      "events_url": "https://api.github.com/repos/thisismudith/Advent-Calendar/events",
      "assignees_url": "https://api.github.com/repos/thisismudith/Advent-Calendar/assignees{/user}",
      "branches_url": "https://api.github.com/repos/thisismudith/Advent-Calendar/branches{/branch}",
      "tags_url": "https://api.github.com/repos/thisismudith/Advent-Calendar/tags",
      "blobs_url": "https://api.github.com/repos/thisismudith/Advent-Calendar/git/blobs{/sha}",
      "git_tags_url": "https://api.github.com/repos/thisismudith/Advent-Calendar/git/tags{/sha}",
      "git_refs_url": "https://api.github.com/repos/thisismudith/Advent-Calendar/git/refs{/sha}",
      "trees_url": "https://api.github.com/repos/thisismudith/Advent-Calendar/git/trees{/sha}",
      "statuses_url": "https://api.github.com/repos/thisismudith/Advent-Calendar/statuses/{sha}",
      "languages_url": "https://api.github.com/repos/thisismudith/Advent-Calendar/languages",
      "stargazers_url": "https://api.github.com/repos/thisismudith/Advent-Calendar/stargazers",
      "contributors_url": "https://api.github.com/repos/thisismudith/Advent-Calendar/contributors",
      "subscribers_url": "https://api.github.com/repos/thisismudith/Advent-Calendar/subscribers",
      "subscription_url": "https://api.github.com/repos/thisismudith/Advent-Calendar/subscription",
      "commits_url": "https://api.github.com/repos/thisismudith/Advent-Calendar/commits{/sha}",
      "git_commits_url": "https://api.github.com/repos/thisismudith/Advent-Calendar/git/commits{/sha}",
      "comments_url": "https://api.github.com/repos/thisismudith/Advent-Calendar/comments{/number}",
      "issue_comment_url": "https://api.github.com/repos/thisismudith/Advent-Calendar/issues/comments{/number}",
      "contents_url": "https://api.github.com/repos/thisismudith/Advent-Calendar/contents/{+path}",
      "compare_url": "https://api.github.com/repos/thisismudith/Advent-Calendar/compare/{base}...{head}",
      "merges_url": "https://api.github.com/repos/thisismudith/Advent-Calendar/merges",
      "archive_url": "https://api.github.com/repos/thisismudith/Advent-Calendar/{archive_format}{/ref}",
      "downloads_url": "https://api.github.com/repos/thisismudith/Advent-Calendar/downloads",
      "issues_url": "https://api.github.com/repos/thisismudith/Advent-Calendar/issues{/number}",
      "pulls_url": "https://api.github.com/repos/thisismudith/Advent-Calendar/pulls{/number}",
      "milestones_url": "https://api.github.com/repos/thisismudith/Advent-Calendar/milestones{/number}",
      "notifications_url": "https://api.github.com/repos/thisismudith/Advent-Calendar/notifications{?since,all,participating}",
      "labels_url": "https://api.github.com/repos/thisismudith/Advent-Calendar/labels{/name}",
      "releases_url": "https://api.github.com/repos/thisismudith/Advent-Calendar/releases{/id}",
      "deployments_url": "https://api.github.com/repos/thisismudith/Advent-Calendar/deployments",
      "created_at": "2022-07-10T17:20:30Z",
      "updated_at": "2022-07-10T17:40:12Z",
      "pushed_at": "2022-12-27T19:56:51Z",
      "git_url": "git://github.com/thisismudith/Advent-Calendar.git",
      "ssh_url": "git@github.com:thisismudith/Advent-Calendar.git",
      "clone_url": "https://github.com/thisismudith/Advent-Calendar.git",
      "svn_url": "https://github.com/thisismudith/Advent-Calendar",
      "homepage": null,
      "size": 32,
      "stargazers_count": 0,
      "watchers_count": 0,
      "language": "Python",
      "has_issues": true,
      "has_projects": true,
      "has_downloads": true,
      "has_wiki": true,
      "has_pages": false,
      "has_discussions": false,
      "forks_count": 0,
      "mirror_url": null,
      "archived": false,
      "disabled": false,
      "open_issues_count": 0,
      "license": {
        "key": "mit",
        "name": "MIT License",
        "spdx_id": "MIT",
        "url": "https://api.github.com/licenses/mit",
        "node_id": "MDc6TGljZW5zZTEz"
      },
      "allow_forking": true,
      "is_template": false,
      "web_commit_signoff_required": false,
      "topics": [
  
      ],
      "visibility": "public",
      "forks": 0,
      "open_issues": 0,
      "watchers": 0,
      "default_branch": "main"
    },
    {
      "id": 578992828,
      "node_id": "R_kgDOIoK6vA",
      "name": "Custom-Slider",
      "full_name": "thisismudith/Custom-Slider",
      "private": false,
      "owner": {
        "login": "thisismudith",
        "id": 72611306,
        "node_id": "MDQ6VXNlcjcyNjExMzA2",
        "avatar_url": "https://avatars.githubusercontent.com/u/72611306?v=4",
        "gravatar_id": "",
        "url": "https://api.github.com/users/thisismudith",
        "html_url": "https://github.com/thisismudith",
        "followers_url": "https://api.github.com/users/thisismudith/followers",
        "following_url": "https://api.github.com/users/thisismudith/following{/other_user}",
        "gists_url": "https://api.github.com/users/thisismudith/gists{/gist_id}",
        "starred_url": "https://api.github.com/users/thisismudith/starred{/owner}{/repo}",
        "subscriptions_url": "https://api.github.com/users/thisismudith/subscriptions",
        "organizations_url": "https://api.github.com/users/thisismudith/orgs",
        "repos_url": "https://api.github.com/users/thisismudith/repos",
        "events_url": "https://api.github.com/users/thisismudith/events{/privacy}",
        "received_events_url": "https://api.github.com/users/thisismudith/received_events",
        "type": "User",
        "site_admin": false
      },
      "html_url": "https://github.com/thisismudith/Custom-Slider",
      "description": "This is a custom range slider that can be easily configured and used. It is developed using HTML, CSS, and Vanilla JS with no additional modules required.",
      "fork": false,
      "url": "https://api.github.com/repos/thisismudith/Custom-Slider",
      "forks_url": "https://api.github.com/repos/thisismudith/Custom-Slider/forks",
      "keys_url": "https://api.github.com/repos/thisismudith/Custom-Slider/keys{/key_id}",
      "collaborators_url": "https://api.github.com/repos/thisismudith/Custom-Slider/collaborators{/collaborator}",
      "teams_url": "https://api.github.com/repos/thisismudith/Custom-Slider/teams",
      "hooks_url": "https://api.github.com/repos/thisismudith/Custom-Slider/hooks",
      "issue_events_url": "https://api.github.com/repos/thisismudith/Custom-Slider/issues/events{/number}",
      "events_url": "https://api.github.com/repos/thisismudith/Custom-Slider/events",
      "assignees_url": "https://api.github.com/repos/thisismudith/Custom-Slider/assignees{/user}",
      "branches_url": "https://api.github.com/repos/thisismudith/Custom-Slider/branches{/branch}",
      "tags_url": "https://api.github.com/repos/thisismudith/Custom-Slider/tags",
      "blobs_url": "https://api.github.com/repos/thisismudith/Custom-Slider/git/blobs{/sha}",
      "git_tags_url": "https://api.github.com/repos/thisismudith/Custom-Slider/git/tags{/sha}",
      "git_refs_url": "https://api.github.com/repos/thisismudith/Custom-Slider/git/refs{/sha}",
      "trees_url": "https://api.github.com/repos/thisismudith/Custom-Slider/git/trees{/sha}",
      "statuses_url": "https://api.github.com/repos/thisismudith/Custom-Slider/statuses/{sha}",
      "languages_url": "https://api.github.com/repos/thisismudith/Custom-Slider/languages",
      "stargazers_url": "https://api.github.com/repos/thisismudith/Custom-Slider/stargazers",
      "contributors_url": "https://api.github.com/repos/thisismudith/Custom-Slider/contributors",
      "subscribers_url": "https://api.github.com/repos/thisismudith/Custom-Slider/subscribers",
      "subscription_url": "https://api.github.com/repos/thisismudith/Custom-Slider/subscription",
      "commits_url": "https://api.github.com/repos/thisismudith/Custom-Slider/commits{/sha}",
      "git_commits_url": "https://api.github.com/repos/thisismudith/Custom-Slider/git/commits{/sha}",
      "comments_url": "https://api.github.com/repos/thisismudith/Custom-Slider/comments{/number}",
      "issue_comment_url": "https://api.github.com/repos/thisismudith/Custom-Slider/issues/comments{/number}",
      "contents_url": "https://api.github.com/repos/thisismudith/Custom-Slider/contents/{+path}",
      "compare_url": "https://api.github.com/repos/thisismudith/Custom-Slider/compare/{base}...{head}",
      "merges_url": "https://api.github.com/repos/thisismudith/Custom-Slider/merges",
      "archive_url": "https://api.github.com/repos/thisismudith/Custom-Slider/{archive_format}{/ref}",
      "downloads_url": "https://api.github.com/repos/thisismudith/Custom-Slider/downloads",
      "issues_url": "https://api.github.com/repos/thisismudith/Custom-Slider/issues{/number}",
      "pulls_url": "https://api.github.com/repos/thisismudith/Custom-Slider/pulls{/number}",
      "milestones_url": "https://api.github.com/repos/thisismudith/Custom-Slider/milestones{/number}",
      "notifications_url": "https://api.github.com/repos/thisismudith/Custom-Slider/notifications{?since,all,participating}",
      "labels_url": "https://api.github.com/repos/thisismudith/Custom-Slider/labels{/name}",
      "releases_url": "https://api.github.com/repos/thisismudith/Custom-Slider/releases{/id}",
      "deployments_url": "https://api.github.com/repos/thisismudith/Custom-Slider/deployments",
      "created_at": "2022-12-16T11:45:24Z",
      "updated_at": "2023-01-31T22:12:24Z",
      "pushed_at": "2023-07-20T13:40:30Z",
      "git_url": "git://github.com/thisismudith/Custom-Slider.git",
      "ssh_url": "git@github.com:thisismudith/Custom-Slider.git",
      "clone_url": "https://github.com/thisismudith/Custom-Slider.git",
      "svn_url": "https://github.com/thisismudith/Custom-Slider",
      "homepage": null,
      "size": 522,
      "stargazers_count": 1,
      "watchers_count": 1,
      "language": "HTML",
      "has_issues": true,
      "has_projects": true,
      "has_downloads": true,
      "has_wiki": true,
      "has_pages": true,
      "has_discussions": false,
      "forks_count": 0,
      "mirror_url": null,
      "archived": false,
      "disabled": false,
      "open_issues_count": 0,
      "license": null,
      "allow_forking": true,
      "is_template": false,
      "web_commit_signoff_required": false,
      "topics": [
  
      ],
      "visibility": "public",
      "forks": 0,
      "open_issues": 0,
      "watchers": 1,
      "default_branch": "main"
    },
    {
      "id": 584424242,
      "node_id": "R_kgDOItWbMg",
      "name": "Jarvis",
      "full_name": "thisismudith/Jarvis",
      "private": false,
      "owner": {
        "login": "thisismudith",
        "id": 72611306,
        "node_id": "MDQ6VXNlcjcyNjExMzA2",
        "avatar_url": "https://avatars.githubusercontent.com/u/72611306?v=4",
        "gravatar_id": "",
        "url": "https://api.github.com/users/thisismudith",
        "html_url": "https://github.com/thisismudith",
        "followers_url": "https://api.github.com/users/thisismudith/followers",
        "following_url": "https://api.github.com/users/thisismudith/following{/other_user}",
        "gists_url": "https://api.github.com/users/thisismudith/gists{/gist_id}",
        "starred_url": "https://api.github.com/users/thisismudith/starred{/owner}{/repo}",
        "subscriptions_url": "https://api.github.com/users/thisismudith/subscriptions",
        "organizations_url": "https://api.github.com/users/thisismudith/orgs",
        "repos_url": "https://api.github.com/users/thisismudith/repos",
        "events_url": "https://api.github.com/users/thisismudith/events{/privacy}",
        "received_events_url": "https://api.github.com/users/thisismudith/received_events",
        "type": "User",
        "site_admin": false
      },
      "html_url": "https://github.com/thisismudith/Jarvis",
      "description": "An AI coded in python for the comfort of users :)",
      "fork": false,
      "url": "https://api.github.com/repos/thisismudith/Jarvis",
      "forks_url": "https://api.github.com/repos/thisismudith/Jarvis/forks",
      "keys_url": "https://api.github.com/repos/thisismudith/Jarvis/keys{/key_id}",
      "collaborators_url": "https://api.github.com/repos/thisismudith/Jarvis/collaborators{/collaborator}",
      "teams_url": "https://api.github.com/repos/thisismudith/Jarvis/teams",
      "hooks_url": "https://api.github.com/repos/thisismudith/Jarvis/hooks",
      "issue_events_url": "https://api.github.com/repos/thisismudith/Jarvis/issues/events{/number}",
      "events_url": "https://api.github.com/repos/thisismudith/Jarvis/events",
      "assignees_url": "https://api.github.com/repos/thisismudith/Jarvis/assignees{/user}",
      "branches_url": "https://api.github.com/repos/thisismudith/Jarvis/branches{/branch}",
      "tags_url": "https://api.github.com/repos/thisismudith/Jarvis/tags",
      "blobs_url": "https://api.github.com/repos/thisismudith/Jarvis/git/blobs{/sha}",
      "git_tags_url": "https://api.github.com/repos/thisismudith/Jarvis/git/tags{/sha}",
      "git_refs_url": "https://api.github.com/repos/thisismudith/Jarvis/git/refs{/sha}",
      "trees_url": "https://api.github.com/repos/thisismudith/Jarvis/git/trees{/sha}",
      "statuses_url": "https://api.github.com/repos/thisismudith/Jarvis/statuses/{sha}",
      "languages_url": "https://api.github.com/repos/thisismudith/Jarvis/languages",
      "stargazers_url": "https://api.github.com/repos/thisismudith/Jarvis/stargazers",
      "contributors_url": "https://api.github.com/repos/thisismudith/Jarvis/contributors",
      "subscribers_url": "https://api.github.com/repos/thisismudith/Jarvis/subscribers",
      "subscription_url": "https://api.github.com/repos/thisismudith/Jarvis/subscription",
      "commits_url": "https://api.github.com/repos/thisismudith/Jarvis/commits{/sha}",
      "git_commits_url": "https://api.github.com/repos/thisismudith/Jarvis/git/commits{/sha}",
      "comments_url": "https://api.github.com/repos/thisismudith/Jarvis/comments{/number}",
      "issue_comment_url": "https://api.github.com/repos/thisismudith/Jarvis/issues/comments{/number}",
      "contents_url": "https://api.github.com/repos/thisismudith/Jarvis/contents/{+path}",
      "compare_url": "https://api.github.com/repos/thisismudith/Jarvis/compare/{base}...{head}",
      "merges_url": "https://api.github.com/repos/thisismudith/Jarvis/merges",
      "archive_url": "https://api.github.com/repos/thisismudith/Jarvis/{archive_format}{/ref}",
      "downloads_url": "https://api.github.com/repos/thisismudith/Jarvis/downloads",
      "issues_url": "https://api.github.com/repos/thisismudith/Jarvis/issues{/number}",
      "pulls_url": "https://api.github.com/repos/thisismudith/Jarvis/pulls{/number}",
      "milestones_url": "https://api.github.com/repos/thisismudith/Jarvis/milestones{/number}",
      "notifications_url": "https://api.github.com/repos/thisismudith/Jarvis/notifications{?since,all,participating}",
      "labels_url": "https://api.github.com/repos/thisismudith/Jarvis/labels{/name}",
      "releases_url": "https://api.github.com/repos/thisismudith/Jarvis/releases{/id}",
      "deployments_url": "https://api.github.com/repos/thisismudith/Jarvis/deployments",
      "created_at": "2023-01-02T14:28:46Z",
      "updated_at": "2023-01-02T14:30:38Z",
      "pushed_at": "2023-01-02T14:32:07Z",
      "git_url": "git://github.com/thisismudith/Jarvis.git",
      "ssh_url": "git@github.com:thisismudith/Jarvis.git",
      "clone_url": "https://github.com/thisismudith/Jarvis.git",
      "svn_url": "https://github.com/thisismudith/Jarvis",
      "homepage": null,
      "size": 154,
      "stargazers_count": 0,
      "watchers_count": 0,
      "language": "Python",
      "has_issues": true,
      "has_projects": true,
      "has_downloads": true,
      "has_wiki": true,
      "has_pages": false,
      "has_discussions": false,
      "forks_count": 0,
      "mirror_url": null,
      "archived": false,
      "disabled": false,
      "open_issues_count": 0,
      "license": {
        "key": "mit",
        "name": "MIT License",
        "spdx_id": "MIT",
        "url": "https://api.github.com/licenses/mit",
        "node_id": "MDc6TGljZW5zZTEz"
      },
      "allow_forking": true,
      "is_template": false,
      "web_commit_signoff_required": false,
      "topics": [
  
      ],
      "visibility": "public",
      "forks": 0,
      "open_issues": 0,
      "watchers": 0,
      "default_branch": "main"
    },
    {
      "id": 576831272,
      "node_id": "R_kgDOImG_KA",
      "name": "Particle-Theory",
      "full_name": "thisismudith/Particle-Theory",
      "private": false,
      "owner": {
        "login": "thisismudith",
        "id": 72611306,
        "node_id": "MDQ6VXNlcjcyNjExMzA2",
        "avatar_url": "https://avatars.githubusercontent.com/u/72611306?v=4",
        "gravatar_id": "",
        "url": "https://api.github.com/users/thisismudith",
        "html_url": "https://github.com/thisismudith",
        "followers_url": "https://api.github.com/users/thisismudith/followers",
        "following_url": "https://api.github.com/users/thisismudith/following{/other_user}",
        "gists_url": "https://api.github.com/users/thisismudith/gists{/gist_id}",
        "starred_url": "https://api.github.com/users/thisismudith/starred{/owner}{/repo}",
        "subscriptions_url": "https://api.github.com/users/thisismudith/subscriptions",
        "organizations_url": "https://api.github.com/users/thisismudith/orgs",
        "repos_url": "https://api.github.com/users/thisismudith/repos",
        "events_url": "https://api.github.com/users/thisismudith/events{/privacy}",
        "received_events_url": "https://api.github.com/users/thisismudith/received_events",
        "type": "User",
        "site_admin": false
      },
      "html_url": "https://github.com/thisismudith/Particle-Theory",
      "description": "Let's apply some physics via web development!",
      "fork": false,
      "url": "https://api.github.com/repos/thisismudith/Particle-Theory",
      "forks_url": "https://api.github.com/repos/thisismudith/Particle-Theory/forks",
      "keys_url": "https://api.github.com/repos/thisismudith/Particle-Theory/keys{/key_id}",
      "collaborators_url": "https://api.github.com/repos/thisismudith/Particle-Theory/collaborators{/collaborator}",
      "teams_url": "https://api.github.com/repos/thisismudith/Particle-Theory/teams",
      "hooks_url": "https://api.github.com/repos/thisismudith/Particle-Theory/hooks",
      "issue_events_url": "https://api.github.com/repos/thisismudith/Particle-Theory/issues/events{/number}",
      "events_url": "https://api.github.com/repos/thisismudith/Particle-Theory/events",
      "assignees_url": "https://api.github.com/repos/thisismudith/Particle-Theory/assignees{/user}",
      "branches_url": "https://api.github.com/repos/thisismudith/Particle-Theory/branches{/branch}",
      "tags_url": "https://api.github.com/repos/thisismudith/Particle-Theory/tags",
      "blobs_url": "https://api.github.com/repos/thisismudith/Particle-Theory/git/blobs{/sha}",
      "git_tags_url": "https://api.github.com/repos/thisismudith/Particle-Theory/git/tags{/sha}",
      "git_refs_url": "https://api.github.com/repos/thisismudith/Particle-Theory/git/refs{/sha}",
      "trees_url": "https://api.github.com/repos/thisismudith/Particle-Theory/git/trees{/sha}",
      "statuses_url": "https://api.github.com/repos/thisismudith/Particle-Theory/statuses/{sha}",
      "languages_url": "https://api.github.com/repos/thisismudith/Particle-Theory/languages",
      "stargazers_url": "https://api.github.com/repos/thisismudith/Particle-Theory/stargazers",
      "contributors_url": "https://api.github.com/repos/thisismudith/Particle-Theory/contributors",
      "subscribers_url": "https://api.github.com/repos/thisismudith/Particle-Theory/subscribers",
      "subscription_url": "https://api.github.com/repos/thisismudith/Particle-Theory/subscription",
      "commits_url": "https://api.github.com/repos/thisismudith/Particle-Theory/commits{/sha}",
      "git_commits_url": "https://api.github.com/repos/thisismudith/Particle-Theory/git/commits{/sha}",
      "comments_url": "https://api.github.com/repos/thisismudith/Particle-Theory/comments{/number}",
      "issue_comment_url": "https://api.github.com/repos/thisismudith/Particle-Theory/issues/comments{/number}",
      "contents_url": "https://api.github.com/repos/thisismudith/Particle-Theory/contents/{+path}",
      "compare_url": "https://api.github.com/repos/thisismudith/Particle-Theory/compare/{base}...{head}",
      "merges_url": "https://api.github.com/repos/thisismudith/Particle-Theory/merges",
      "archive_url": "https://api.github.com/repos/thisismudith/Particle-Theory/{archive_format}{/ref}",
      "downloads_url": "https://api.github.com/repos/thisismudith/Particle-Theory/downloads",
      "issues_url": "https://api.github.com/repos/thisismudith/Particle-Theory/issues{/number}",
      "pulls_url": "https://api.github.com/repos/thisismudith/Particle-Theory/pulls{/number}",
      "milestones_url": "https://api.github.com/repos/thisismudith/Particle-Theory/milestones{/number}",
      "notifications_url": "https://api.github.com/repos/thisismudith/Particle-Theory/notifications{?since,all,participating}",
      "labels_url": "https://api.github.com/repos/thisismudith/Particle-Theory/labels{/name}",
      "releases_url": "https://api.github.com/repos/thisismudith/Particle-Theory/releases{/id}",
      "deployments_url": "https://api.github.com/repos/thisismudith/Particle-Theory/deployments",
      "created_at": "2022-12-11T05:40:23Z",
      "updated_at": "2022-12-11T05:40:30Z",
      "pushed_at": "2022-12-12T00:14:46Z",
      "git_url": "git://github.com/thisismudith/Particle-Theory.git",
      "ssh_url": "git@github.com:thisismudith/Particle-Theory.git",
      "clone_url": "https://github.com/thisismudith/Particle-Theory.git",
      "svn_url": "https://github.com/thisismudith/Particle-Theory",
      "homepage": null,
      "size": 269,
      "stargazers_count": 0,
      "watchers_count": 0,
      "language": "CSS",
      "has_issues": true,
      "has_projects": true,
      "has_downloads": true,
      "has_wiki": true,
      "has_pages": true,
      "has_discussions": false,
      "forks_count": 0,
      "mirror_url": null,
      "archived": false,
      "disabled": false,
      "open_issues_count": 0,
      "license": {
        "key": "mit",
        "name": "MIT License",
        "spdx_id": "MIT",
        "url": "https://api.github.com/licenses/mit",
        "node_id": "MDc6TGljZW5zZTEz"
      },
      "allow_forking": true,
      "is_template": false,
      "web_commit_signoff_required": false,
      "topics": [
  
      ],
      "visibility": "public",
      "forks": 0,
      "open_issues": 0,
      "watchers": 0,
      "default_branch": "main"
    },
    {
      "id": 597631482,
      "node_id": "R_kgDOI58h-g",
      "name": "PassAger",
      "full_name": "thisismudith/PassAger",
      "private": false,
      "owner": {
        "login": "thisismudith",
        "id": 72611306,
        "node_id": "MDQ6VXNlcjcyNjExMzA2",
        "avatar_url": "https://avatars.githubusercontent.com/u/72611306?v=4",
        "gravatar_id": "",
        "url": "https://api.github.com/users/thisismudith",
        "html_url": "https://github.com/thisismudith",
        "followers_url": "https://api.github.com/users/thisismudith/followers",
        "following_url": "https://api.github.com/users/thisismudith/following{/other_user}",
        "gists_url": "https://api.github.com/users/thisismudith/gists{/gist_id}",
        "starred_url": "https://api.github.com/users/thisismudith/starred{/owner}{/repo}",
        "subscriptions_url": "https://api.github.com/users/thisismudith/subscriptions",
        "organizations_url": "https://api.github.com/users/thisismudith/orgs",
        "repos_url": "https://api.github.com/users/thisismudith/repos",
        "events_url": "https://api.github.com/users/thisismudith/events{/privacy}",
        "received_events_url": "https://api.github.com/users/thisismudith/received_events",
        "type": "User",
        "site_admin": false
      },
      "html_url": "https://github.com/thisismudith/PassAger",
      "description": "An all-in-one password manager tool with encryption facilities and a lot more...",
      "fork": false,
      "url": "https://api.github.com/repos/thisismudith/PassAger",
      "forks_url": "https://api.github.com/repos/thisismudith/PassAger/forks",
      "keys_url": "https://api.github.com/repos/thisismudith/PassAger/keys{/key_id}",
      "collaborators_url": "https://api.github.com/repos/thisismudith/PassAger/collaborators{/collaborator}",
      "teams_url": "https://api.github.com/repos/thisismudith/PassAger/teams",
      "hooks_url": "https://api.github.com/repos/thisismudith/PassAger/hooks",
      "issue_events_url": "https://api.github.com/repos/thisismudith/PassAger/issues/events{/number}",
      "events_url": "https://api.github.com/repos/thisismudith/PassAger/events",
      "assignees_url": "https://api.github.com/repos/thisismudith/PassAger/assignees{/user}",
      "branches_url": "https://api.github.com/repos/thisismudith/PassAger/branches{/branch}",
      "tags_url": "https://api.github.com/repos/thisismudith/PassAger/tags",
      "blobs_url": "https://api.github.com/repos/thisismudith/PassAger/git/blobs{/sha}",
      "git_tags_url": "https://api.github.com/repos/thisismudith/PassAger/git/tags{/sha}",
      "git_refs_url": "https://api.github.com/repos/thisismudith/PassAger/git/refs{/sha}",
      "trees_url": "https://api.github.com/repos/thisismudith/PassAger/git/trees{/sha}",
      "statuses_url": "https://api.github.com/repos/thisismudith/PassAger/statuses/{sha}",
      "languages_url": "https://api.github.com/repos/thisismudith/PassAger/languages",
      "stargazers_url": "https://api.github.com/repos/thisismudith/PassAger/stargazers",
      "contributors_url": "https://api.github.com/repos/thisismudith/PassAger/contributors",
      "subscribers_url": "https://api.github.com/repos/thisismudith/PassAger/subscribers",
      "subscription_url": "https://api.github.com/repos/thisismudith/PassAger/subscription",
      "commits_url": "https://api.github.com/repos/thisismudith/PassAger/commits{/sha}",
      "git_commits_url": "https://api.github.com/repos/thisismudith/PassAger/git/commits{/sha}",
      "comments_url": "https://api.github.com/repos/thisismudith/PassAger/comments{/number}",
      "issue_comment_url": "https://api.github.com/repos/thisismudith/PassAger/issues/comments{/number}",
      "contents_url": "https://api.github.com/repos/thisismudith/PassAger/contents/{+path}",
      "compare_url": "https://api.github.com/repos/thisismudith/PassAger/compare/{base}...{head}",
      "merges_url": "https://api.github.com/repos/thisismudith/PassAger/merges",
      "archive_url": "https://api.github.com/repos/thisismudith/PassAger/{archive_format}{/ref}",
      "downloads_url": "https://api.github.com/repos/thisismudith/PassAger/downloads",
      "issues_url": "https://api.github.com/repos/thisismudith/PassAger/issues{/number}",
      "pulls_url": "https://api.github.com/repos/thisismudith/PassAger/pulls{/number}",
      "milestones_url": "https://api.github.com/repos/thisismudith/PassAger/milestones{/number}",
      "notifications_url": "https://api.github.com/repos/thisismudith/PassAger/notifications{?since,all,participating}",
      "labels_url": "https://api.github.com/repos/thisismudith/PassAger/labels{/name}",
      "releases_url": "https://api.github.com/repos/thisismudith/PassAger/releases{/id}",
      "deployments_url": "https://api.github.com/repos/thisismudith/PassAger/deployments",
      "created_at": "2023-02-05T06:01:45Z",
      "updated_at": "2023-02-05T06:26:13Z",
      "pushed_at": "2023-02-05T06:26:09Z",
      "git_url": "git://github.com/thisismudith/PassAger.git",
      "ssh_url": "git@github.com:thisismudith/PassAger.git",
      "clone_url": "https://github.com/thisismudith/PassAger.git",
      "svn_url": "https://github.com/thisismudith/PassAger",
      "homepage": null,
      "size": 1,
      "stargazers_count": 0,
      "watchers_count": 0,
      "language": "CSS",
      "has_issues": true,
      "has_projects": true,
      "has_downloads": true,
      "has_wiki": true,
      "has_pages": false,
      "has_discussions": false,
      "forks_count": 0,
      "mirror_url": null,
      "archived": false,
      "disabled": false,
      "open_issues_count": 0,
      "license": {
        "key": "mit",
        "name": "MIT License",
        "spdx_id": "MIT",
        "url": "https://api.github.com/licenses/mit",
        "node_id": "MDc6TGljZW5zZTEz"
      },
      "allow_forking": true,
      "is_template": false,
      "web_commit_signoff_required": false,
      "topics": [
  
      ],
      "visibility": "public",
      "forks": 0,
      "open_issues": 0,
      "watchers": 0,
      "default_branch": "main"
    },
    {
      "id": 509671004,
      "node_id": "R_kgDOHmD2XA",
      "name": "Temporary-Files-Remover",
      "full_name": "thisismudith/Temporary-Files-Remover",
      "private": false,
      "owner": {
        "login": "thisismudith",
        "id": 72611306,
        "node_id": "MDQ6VXNlcjcyNjExMzA2",
        "avatar_url": "https://avatars.githubusercontent.com/u/72611306?v=4",
        "gravatar_id": "",
        "url": "https://api.github.com/users/thisismudith",
        "html_url": "https://github.com/thisismudith",
        "followers_url": "https://api.github.com/users/thisismudith/followers",
        "following_url": "https://api.github.com/users/thisismudith/following{/other_user}",
        "gists_url": "https://api.github.com/users/thisismudith/gists{/gist_id}",
        "starred_url": "https://api.github.com/users/thisismudith/starred{/owner}{/repo}",
        "subscriptions_url": "https://api.github.com/users/thisismudith/subscriptions",
        "organizations_url": "https://api.github.com/users/thisismudith/orgs",
        "repos_url": "https://api.github.com/users/thisismudith/repos",
        "events_url": "https://api.github.com/users/thisismudith/events{/privacy}",
        "received_events_url": "https://api.github.com/users/thisismudith/received_events",
        "type": "User",
        "site_admin": false
      },
      "html_url": "https://github.com/thisismudith/Temporary-Files-Remover",
      "description": "This is a python script embed with a `.json` file which will help you in removing any temporary files you want. It basically will delete every file inside your temporary folder based on your customized settings.",
      "fork": false,
      "url": "https://api.github.com/repos/thisismudith/Temporary-Files-Remover",
      "forks_url": "https://api.github.com/repos/thisismudith/Temporary-Files-Remover/forks",
      "keys_url": "https://api.github.com/repos/thisismudith/Temporary-Files-Remover/keys{/key_id}",
      "collaborators_url": "https://api.github.com/repos/thisismudith/Temporary-Files-Remover/collaborators{/collaborator}",
      "teams_url": "https://api.github.com/repos/thisismudith/Temporary-Files-Remover/teams",
      "hooks_url": "https://api.github.com/repos/thisismudith/Temporary-Files-Remover/hooks",
      "issue_events_url": "https://api.github.com/repos/thisismudith/Temporary-Files-Remover/issues/events{/number}",
      "events_url": "https://api.github.com/repos/thisismudith/Temporary-Files-Remover/events",
      "assignees_url": "https://api.github.com/repos/thisismudith/Temporary-Files-Remover/assignees{/user}",
      "branches_url": "https://api.github.com/repos/thisismudith/Temporary-Files-Remover/branches{/branch}",
      "tags_url": "https://api.github.com/repos/thisismudith/Temporary-Files-Remover/tags",
      "blobs_url": "https://api.github.com/repos/thisismudith/Temporary-Files-Remover/git/blobs{/sha}",
      "git_tags_url": "https://api.github.com/repos/thisismudith/Temporary-Files-Remover/git/tags{/sha}",
      "git_refs_url": "https://api.github.com/repos/thisismudith/Temporary-Files-Remover/git/refs{/sha}",
      "trees_url": "https://api.github.com/repos/thisismudith/Temporary-Files-Remover/git/trees{/sha}",
      "statuses_url": "https://api.github.com/repos/thisismudith/Temporary-Files-Remover/statuses/{sha}",
      "languages_url": "https://api.github.com/repos/thisismudith/Temporary-Files-Remover/languages",
      "stargazers_url": "https://api.github.com/repos/thisismudith/Temporary-Files-Remover/stargazers",
      "contributors_url": "https://api.github.com/repos/thisismudith/Temporary-Files-Remover/contributors",
      "subscribers_url": "https://api.github.com/repos/thisismudith/Temporary-Files-Remover/subscribers",
      "subscription_url": "https://api.github.com/repos/thisismudith/Temporary-Files-Remover/subscription",
      "commits_url": "https://api.github.com/repos/thisismudith/Temporary-Files-Remover/commits{/sha}",
      "git_commits_url": "https://api.github.com/repos/thisismudith/Temporary-Files-Remover/git/commits{/sha}",
      "comments_url": "https://api.github.com/repos/thisismudith/Temporary-Files-Remover/comments{/number}",
      "issue_comment_url": "https://api.github.com/repos/thisismudith/Temporary-Files-Remover/issues/comments{/number}",
      "contents_url": "https://api.github.com/repos/thisismudith/Temporary-Files-Remover/contents/{+path}",
      "compare_url": "https://api.github.com/repos/thisismudith/Temporary-Files-Remover/compare/{base}...{head}",
      "merges_url": "https://api.github.com/repos/thisismudith/Temporary-Files-Remover/merges",
      "archive_url": "https://api.github.com/repos/thisismudith/Temporary-Files-Remover/{archive_format}{/ref}",
      "downloads_url": "https://api.github.com/repos/thisismudith/Temporary-Files-Remover/downloads",
      "issues_url": "https://api.github.com/repos/thisismudith/Temporary-Files-Remover/issues{/number}",
      "pulls_url": "https://api.github.com/repos/thisismudith/Temporary-Files-Remover/pulls{/number}",
      "milestones_url": "https://api.github.com/repos/thisismudith/Temporary-Files-Remover/milestones{/number}",
      "notifications_url": "https://api.github.com/repos/thisismudith/Temporary-Files-Remover/notifications{?since,all,participating}",
      "labels_url": "https://api.github.com/repos/thisismudith/Temporary-Files-Remover/labels{/name}",
      "releases_url": "https://api.github.com/repos/thisismudith/Temporary-Files-Remover/releases{/id}",
      "deployments_url": "https://api.github.com/repos/thisismudith/Temporary-Files-Remover/deployments",
      "created_at": "2022-07-02T05:51:31Z",
      "updated_at": "2022-07-02T05:52:41Z",
      "pushed_at": "2022-07-09T11:11:53Z",
      "git_url": "git://github.com/thisismudith/Temporary-Files-Remover.git",
      "ssh_url": "git@github.com:thisismudith/Temporary-Files-Remover.git",
      "clone_url": "https://github.com/thisismudith/Temporary-Files-Remover.git",
      "svn_url": "https://github.com/thisismudith/Temporary-Files-Remover",
      "homepage": null,
      "size": 30,
      "stargazers_count": 0,
      "watchers_count": 0,
      "language": "Python",
      "has_issues": true,
      "has_projects": true,
      "has_downloads": true,
      "has_wiki": true,
      "has_pages": false,
      "has_discussions": false,
      "forks_count": 0,
      "mirror_url": null,
      "archived": false,
      "disabled": false,
      "open_issues_count": 0,
      "license": {
        "key": "mit",
        "name": "MIT License",
        "spdx_id": "MIT",
        "url": "https://api.github.com/licenses/mit",
        "node_id": "MDc6TGljZW5zZTEz"
      },
      "allow_forking": true,
      "is_template": false,
      "web_commit_signoff_required": false,
      "topics": [
  
      ],
      "visibility": "public",
      "forks": 0,
      "open_issues": 0,
      "watchers": 0,
      "default_branch": "main"
    },
    {
      "id": 555217783,
      "node_id": "R_kgDOIRfzdw",
      "name": "The-Cubology",
      "full_name": "thisismudith/The-Cubology",
      "private": false,
      "owner": {
        "login": "thisismudith",
        "id": 72611306,
        "node_id": "MDQ6VXNlcjcyNjExMzA2",
        "avatar_url": "https://avatars.githubusercontent.com/u/72611306?v=4",
        "gravatar_id": "",
        "url": "https://api.github.com/users/thisismudith",
        "html_url": "https://github.com/thisismudith",
        "followers_url": "https://api.github.com/users/thisismudith/followers",
        "following_url": "https://api.github.com/users/thisismudith/following{/other_user}",
        "gists_url": "https://api.github.com/users/thisismudith/gists{/gist_id}",
        "starred_url": "https://api.github.com/users/thisismudith/starred{/owner}{/repo}",
        "subscriptions_url": "https://api.github.com/users/thisismudith/subscriptions",
        "organizations_url": "https://api.github.com/users/thisismudith/orgs",
        "repos_url": "https://api.github.com/users/thisismudith/repos",
        "events_url": "https://api.github.com/users/thisismudith/events{/privacy}",
        "received_events_url": "https://api.github.com/users/thisismudith/received_events",
        "type": "User",
        "site_admin": false
      },
      "html_url": "https://github.com/thisismudith/The-Cubology",
      "description": "A website designed by a cuber, for cubers...",
      "fork": false,
      "url": "https://api.github.com/repos/thisismudith/The-Cubology",
      "forks_url": "https://api.github.com/repos/thisismudith/The-Cubology/forks",
      "keys_url": "https://api.github.com/repos/thisismudith/The-Cubology/keys{/key_id}",
      "collaborators_url": "https://api.github.com/repos/thisismudith/The-Cubology/collaborators{/collaborator}",
      "teams_url": "https://api.github.com/repos/thisismudith/The-Cubology/teams",
      "hooks_url": "https://api.github.com/repos/thisismudith/The-Cubology/hooks",
      "issue_events_url": "https://api.github.com/repos/thisismudith/The-Cubology/issues/events{/number}",
      "events_url": "https://api.github.com/repos/thisismudith/The-Cubology/events",
      "assignees_url": "https://api.github.com/repos/thisismudith/The-Cubology/assignees{/user}",
      "branches_url": "https://api.github.com/repos/thisismudith/The-Cubology/branches{/branch}",
      "tags_url": "https://api.github.com/repos/thisismudith/The-Cubology/tags",
      "blobs_url": "https://api.github.com/repos/thisismudith/The-Cubology/git/blobs{/sha}",
      "git_tags_url": "https://api.github.com/repos/thisismudith/The-Cubology/git/tags{/sha}",
      "git_refs_url": "https://api.github.com/repos/thisismudith/The-Cubology/git/refs{/sha}",
      "trees_url": "https://api.github.com/repos/thisismudith/The-Cubology/git/trees{/sha}",
      "statuses_url": "https://api.github.com/repos/thisismudith/The-Cubology/statuses/{sha}",
      "languages_url": "https://api.github.com/repos/thisismudith/The-Cubology/languages",
      "stargazers_url": "https://api.github.com/repos/thisismudith/The-Cubology/stargazers",
      "contributors_url": "https://api.github.com/repos/thisismudith/The-Cubology/contributors",
      "subscribers_url": "https://api.github.com/repos/thisismudith/The-Cubology/subscribers",
      "subscription_url": "https://api.github.com/repos/thisismudith/The-Cubology/subscription",
      "commits_url": "https://api.github.com/repos/thisismudith/The-Cubology/commits{/sha}",
      "git_commits_url": "https://api.github.com/repos/thisismudith/The-Cubology/git/commits{/sha}",
      "comments_url": "https://api.github.com/repos/thisismudith/The-Cubology/comments{/number}",
      "issue_comment_url": "https://api.github.com/repos/thisismudith/The-Cubology/issues/comments{/number}",
      "contents_url": "https://api.github.com/repos/thisismudith/The-Cubology/contents/{+path}",
      "compare_url": "https://api.github.com/repos/thisismudith/The-Cubology/compare/{base}...{head}",
      "merges_url": "https://api.github.com/repos/thisismudith/The-Cubology/merges",
      "archive_url": "https://api.github.com/repos/thisismudith/The-Cubology/{archive_format}{/ref}",
      "downloads_url": "https://api.github.com/repos/thisismudith/The-Cubology/downloads",
      "issues_url": "https://api.github.com/repos/thisismudith/The-Cubology/issues{/number}",
      "pulls_url": "https://api.github.com/repos/thisismudith/The-Cubology/pulls{/number}",
      "milestones_url": "https://api.github.com/repos/thisismudith/The-Cubology/milestones{/number}",
      "notifications_url": "https://api.github.com/repos/thisismudith/The-Cubology/notifications{?since,all,participating}",
      "labels_url": "https://api.github.com/repos/thisismudith/The-Cubology/labels{/name}",
      "releases_url": "https://api.github.com/repos/thisismudith/The-Cubology/releases{/id}",
      "deployments_url": "https://api.github.com/repos/thisismudith/The-Cubology/deployments",
      "created_at": "2022-10-21T06:46:03Z",
      "updated_at": "2023-01-15T12:34:38Z",
      "pushed_at": "2023-07-22T11:15:01Z",
      "git_url": "git://github.com/thisismudith/The-Cubology.git",
      "ssh_url": "git@github.com:thisismudith/The-Cubology.git",
      "clone_url": "https://github.com/thisismudith/The-Cubology.git",
      "svn_url": "https://github.com/thisismudith/The-Cubology",
      "homepage": null,
      "size": 43059,
      "stargazers_count": 0,
      "watchers_count": 0,
      "language": "JavaScript",
      "has_issues": true,
      "has_projects": true,
      "has_downloads": true,
      "has_wiki": true,
      "has_pages": true,
      "has_discussions": false,
      "forks_count": 0,
      "mirror_url": null,
      "archived": false,
      "disabled": false,
      "open_issues_count": 0,
      "license": null,
      "allow_forking": true,
      "is_template": false,
      "web_commit_signoff_required": false,
      "topics": [
  
      ],
      "visibility": "public",
      "forks": 0,
      "open_issues": 0,
      "watchers": 0,
      "default_branch": "main"
    },
    {
      "id": 701467633,
      "node_id": "R_kgDOKc-L8Q",
      "name": "thisismudith",
      "full_name": "thisismudith/thisismudith",
      "private": false,
      "owner": {
        "login": "thisismudith",
        "id": 72611306,
        "node_id": "MDQ6VXNlcjcyNjExMzA2",
        "avatar_url": "https://avatars.githubusercontent.com/u/72611306?v=4",
        "gravatar_id": "",
        "url": "https://api.github.com/users/thisismudith",
        "html_url": "https://github.com/thisismudith",
        "followers_url": "https://api.github.com/users/thisismudith/followers",
        "following_url": "https://api.github.com/users/thisismudith/following{/other_user}",
        "gists_url": "https://api.github.com/users/thisismudith/gists{/gist_id}",
        "starred_url": "https://api.github.com/users/thisismudith/starred{/owner}{/repo}",
        "subscriptions_url": "https://api.github.com/users/thisismudith/subscriptions",
        "organizations_url": "https://api.github.com/users/thisismudith/orgs",
        "repos_url": "https://api.github.com/users/thisismudith/repos",
        "events_url": "https://api.github.com/users/thisismudith/events{/privacy}",
        "received_events_url": "https://api.github.com/users/thisismudith/received_events",
        "type": "User",
        "site_admin": false
      },
      "html_url": "https://github.com/thisismudith/thisismudith",
      "description": "Config files for my GitHub profile",
      "fork": false,
      "url": "https://api.github.com/repos/thisismudith/thisismudith",
      "forks_url": "https://api.github.com/repos/thisismudith/thisismudith/forks",
      "keys_url": "https://api.github.com/repos/thisismudith/thisismudith/keys{/key_id}",
      "collaborators_url": "https://api.github.com/repos/thisismudith/thisismudith/collaborators{/collaborator}",
      "teams_url": "https://api.github.com/repos/thisismudith/thisismudith/teams",
      "hooks_url": "https://api.github.com/repos/thisismudith/thisismudith/hooks",
      "issue_events_url": "https://api.github.com/repos/thisismudith/thisismudith/issues/events{/number}",
      "events_url": "https://api.github.com/repos/thisismudith/thisismudith/events",
      "assignees_url": "https://api.github.com/repos/thisismudith/thisismudith/assignees{/user}",
      "branches_url": "https://api.github.com/repos/thisismudith/thisismudith/branches{/branch}",
      "tags_url": "https://api.github.com/repos/thisismudith/thisismudith/tags",
      "blobs_url": "https://api.github.com/repos/thisismudith/thisismudith/git/blobs{/sha}",
      "git_tags_url": "https://api.github.com/repos/thisismudith/thisismudith/git/tags{/sha}",
      "git_refs_url": "https://api.github.com/repos/thisismudith/thisismudith/git/refs{/sha}",
      "trees_url": "https://api.github.com/repos/thisismudith/thisismudith/git/trees{/sha}",
      "statuses_url": "https://api.github.com/repos/thisismudith/thisismudith/statuses/{sha}",
      "languages_url": "https://api.github.com/repos/thisismudith/thisismudith/languages",
      "stargazers_url": "https://api.github.com/repos/thisismudith/thisismudith/stargazers",
      "contributors_url": "https://api.github.com/repos/thisismudith/thisismudith/contributors",
      "subscribers_url": "https://api.github.com/repos/thisismudith/thisismudith/subscribers",
      "subscription_url": "https://api.github.com/repos/thisismudith/thisismudith/subscription",
      "commits_url": "https://api.github.com/repos/thisismudith/thisismudith/commits{/sha}",
      "git_commits_url": "https://api.github.com/repos/thisismudith/thisismudith/git/commits{/sha}",
      "comments_url": "https://api.github.com/repos/thisismudith/thisismudith/comments{/number}",
      "issue_comment_url": "https://api.github.com/repos/thisismudith/thisismudith/issues/comments{/number}",
      "contents_url": "https://api.github.com/repos/thisismudith/thisismudith/contents/{+path}",
      "compare_url": "https://api.github.com/repos/thisismudith/thisismudith/compare/{base}...{head}",
      "merges_url": "https://api.github.com/repos/thisismudith/thisismudith/merges",
      "archive_url": "https://api.github.com/repos/thisismudith/thisismudith/{archive_format}{/ref}",
      "downloads_url": "https://api.github.com/repos/thisismudith/thisismudith/downloads",
      "issues_url": "https://api.github.com/repos/thisismudith/thisismudith/issues{/number}",
      "pulls_url": "https://api.github.com/repos/thisismudith/thisismudith/pulls{/number}",
      "milestones_url": "https://api.github.com/repos/thisismudith/thisismudith/milestones{/number}",
      "notifications_url": "https://api.github.com/repos/thisismudith/thisismudith/notifications{?since,all,participating}",
      "labels_url": "https://api.github.com/repos/thisismudith/thisismudith/labels{/name}",
      "releases_url": "https://api.github.com/repos/thisismudith/thisismudith/releases{/id}",
      "deployments_url": "https://api.github.com/repos/thisismudith/thisismudith/deployments",
      "created_at": "2023-10-06T17:41:21Z",
      "updated_at": "2023-10-06T17:41:21Z",
      "pushed_at": "2023-10-06T17:46:03Z",
      "git_url": "git://github.com/thisismudith/thisismudith.git",
      "ssh_url": "git@github.com:thisismudith/thisismudith.git",
      "clone_url": "https://github.com/thisismudith/thisismudith.git",
      "svn_url": "https://github.com/thisismudith/thisismudith",
      "homepage": null,
      "size": 4,
      "stargazers_count": 0,
      "watchers_count": 0,
      "language": null,
      "has_issues": true,
      "has_projects": true,
      "has_downloads": true,
      "has_wiki": true,
      "has_pages": false,
      "has_discussions": false,
      "forks_count": 0,
      "mirror_url": null,
      "archived": false,
      "disabled": false,
      "open_issues_count": 0,
      "license": null,
      "allow_forking": true,
      "is_template": false,
      "web_commit_signoff_required": false,
      "topics": [
  
      ],
      "visibility": "public",
      "forks": 0,
      "open_issues": 0,
      "watchers": 0,
      "default_branch": "main"
    },
    {
      "id": 532535526,
      "node_id": "R_kgDOH73Y5g",
      "name": "TicTacToe",
      "full_name": "thisismudith/TicTacToe",
      "private": false,
      "owner": {
        "login": "thisismudith",
        "id": 72611306,
        "node_id": "MDQ6VXNlcjcyNjExMzA2",
        "avatar_url": "https://avatars.githubusercontent.com/u/72611306?v=4",
        "gravatar_id": "",
        "url": "https://api.github.com/users/thisismudith",
        "html_url": "https://github.com/thisismudith",
        "followers_url": "https://api.github.com/users/thisismudith/followers",
        "following_url": "https://api.github.com/users/thisismudith/following{/other_user}",
        "gists_url": "https://api.github.com/users/thisismudith/gists{/gist_id}",
        "starred_url": "https://api.github.com/users/thisismudith/starred{/owner}{/repo}",
        "subscriptions_url": "https://api.github.com/users/thisismudith/subscriptions",
        "organizations_url": "https://api.github.com/users/thisismudith/orgs",
        "repos_url": "https://api.github.com/users/thisismudith/repos",
        "events_url": "https://api.github.com/users/thisismudith/events{/privacy}",
        "received_events_url": "https://api.github.com/users/thisismudith/received_events",
        "type": "User",
        "site_admin": false
      },
      "html_url": "https://github.com/thisismudith/TicTacToe",
      "description": "This is a simple one-file python program that runs with the help of a json file. The game supports both Singleplayer and Multiplayer options!",
      "fork": false,
      "url": "https://api.github.com/repos/thisismudith/TicTacToe",
      "forks_url": "https://api.github.com/repos/thisismudith/TicTacToe/forks",
      "keys_url": "https://api.github.com/repos/thisismudith/TicTacToe/keys{/key_id}",
      "collaborators_url": "https://api.github.com/repos/thisismudith/TicTacToe/collaborators{/collaborator}",
      "teams_url": "https://api.github.com/repos/thisismudith/TicTacToe/teams",
      "hooks_url": "https://api.github.com/repos/thisismudith/TicTacToe/hooks",
      "issue_events_url": "https://api.github.com/repos/thisismudith/TicTacToe/issues/events{/number}",
      "events_url": "https://api.github.com/repos/thisismudith/TicTacToe/events",
      "assignees_url": "https://api.github.com/repos/thisismudith/TicTacToe/assignees{/user}",
      "branches_url": "https://api.github.com/repos/thisismudith/TicTacToe/branches{/branch}",
      "tags_url": "https://api.github.com/repos/thisismudith/TicTacToe/tags",
      "blobs_url": "https://api.github.com/repos/thisismudith/TicTacToe/git/blobs{/sha}",
      "git_tags_url": "https://api.github.com/repos/thisismudith/TicTacToe/git/tags{/sha}",
      "git_refs_url": "https://api.github.com/repos/thisismudith/TicTacToe/git/refs{/sha}",
      "trees_url": "https://api.github.com/repos/thisismudith/TicTacToe/git/trees{/sha}",
      "statuses_url": "https://api.github.com/repos/thisismudith/TicTacToe/statuses/{sha}",
      "languages_url": "https://api.github.com/repos/thisismudith/TicTacToe/languages",
      "stargazers_url": "https://api.github.com/repos/thisismudith/TicTacToe/stargazers",
      "contributors_url": "https://api.github.com/repos/thisismudith/TicTacToe/contributors",
      "subscribers_url": "https://api.github.com/repos/thisismudith/TicTacToe/subscribers",
      "subscription_url": "https://api.github.com/repos/thisismudith/TicTacToe/subscription",
      "commits_url": "https://api.github.com/repos/thisismudith/TicTacToe/commits{/sha}",
      "git_commits_url": "https://api.github.com/repos/thisismudith/TicTacToe/git/commits{/sha}",
      "comments_url": "https://api.github.com/repos/thisismudith/TicTacToe/comments{/number}",
      "issue_comment_url": "https://api.github.com/repos/thisismudith/TicTacToe/issues/comments{/number}",
      "contents_url": "https://api.github.com/repos/thisismudith/TicTacToe/contents/{+path}",
      "compare_url": "https://api.github.com/repos/thisismudith/TicTacToe/compare/{base}...{head}",
      "merges_url": "https://api.github.com/repos/thisismudith/TicTacToe/merges",
      "archive_url": "https://api.github.com/repos/thisismudith/TicTacToe/{archive_format}{/ref}",
      "downloads_url": "https://api.github.com/repos/thisismudith/TicTacToe/downloads",
      "issues_url": "https://api.github.com/repos/thisismudith/TicTacToe/issues{/number}",
      "pulls_url": "https://api.github.com/repos/thisismudith/TicTacToe/pulls{/number}",
      "milestones_url": "https://api.github.com/repos/thisismudith/TicTacToe/milestones{/number}",
      "notifications_url": "https://api.github.com/repos/thisismudith/TicTacToe/notifications{?since,all,participating}",
      "labels_url": "https://api.github.com/repos/thisismudith/TicTacToe/labels{/name}",
      "releases_url": "https://api.github.com/repos/thisismudith/TicTacToe/releases{/id}",
      "deployments_url": "https://api.github.com/repos/thisismudith/TicTacToe/deployments",
      "created_at": "2022-09-04T12:35:11Z",
      "updated_at": "2022-09-04T12:35:17Z",
      "pushed_at": "2022-09-04T16:29:11Z",
      "git_url": "git://github.com/thisismudith/TicTacToe.git",
      "ssh_url": "git@github.com:thisismudith/TicTacToe.git",
      "clone_url": "https://github.com/thisismudith/TicTacToe.git",
      "svn_url": "https://github.com/thisismudith/TicTacToe",
      "homepage": null,
      "size": 18,
      "stargazers_count": 0,
      "watchers_count": 0,
      "language": "Python",
      "has_issues": true,
      "has_projects": true,
      "has_downloads": true,
      "has_wiki": true,
      "has_pages": false,
      "has_discussions": false,
      "forks_count": 0,
      "mirror_url": null,
      "archived": false,
      "disabled": false,
      "open_issues_count": 0,
      "license": {
        "key": "mit",
        "name": "MIT License",
        "spdx_id": "MIT",
        "url": "https://api.github.com/licenses/mit",
        "node_id": "MDc6TGljZW5zZTEz"
      },
      "allow_forking": true,
      "is_template": false,
      "web_commit_signoff_required": false,
      "topics": [
  
      ],
      "visibility": "public",
      "forks": 0,
      "open_issues": 0,
      "watchers": 0,
      "default_branch": "main"
    },
    {
      "id": 596266837,
      "node_id": "R_kgDOI4pPVQ",
      "name": "Uplift",
      "full_name": "thisismudith/Uplift",
      "private": false,
      "owner": {
        "login": "thisismudith",
        "id": 72611306,
        "node_id": "MDQ6VXNlcjcyNjExMzA2",
        "avatar_url": "https://avatars.githubusercontent.com/u/72611306?v=4",
        "gravatar_id": "",
        "url": "https://api.github.com/users/thisismudith",
        "html_url": "https://github.com/thisismudith",
        "followers_url": "https://api.github.com/users/thisismudith/followers",
        "following_url": "https://api.github.com/users/thisismudith/following{/other_user}",
        "gists_url": "https://api.github.com/users/thisismudith/gists{/gist_id}",
        "starred_url": "https://api.github.com/users/thisismudith/starred{/owner}{/repo}",
        "subscriptions_url": "https://api.github.com/users/thisismudith/subscriptions",
        "organizations_url": "https://api.github.com/users/thisismudith/orgs",
        "repos_url": "https://api.github.com/users/thisismudith/repos",
        "events_url": "https://api.github.com/users/thisismudith/events{/privacy}",
        "received_events_url": "https://api.github.com/users/thisismudith/received_events",
        "type": "User",
        "site_admin": false
      },
      "html_url": "https://github.com/thisismudith/Uplift",
      "description": "Enjoy playing with the lifts? Uplift is a virtual lift GUI created for fun. Make sure to complete the easter eggs! Enjoy the lift playground :)",
      "fork": false,
      "url": "https://api.github.com/repos/thisismudith/Uplift",
      "forks_url": "https://api.github.com/repos/thisismudith/Uplift/forks",
      "keys_url": "https://api.github.com/repos/thisismudith/Uplift/keys{/key_id}",
      "collaborators_url": "https://api.github.com/repos/thisismudith/Uplift/collaborators{/collaborator}",
      "teams_url": "https://api.github.com/repos/thisismudith/Uplift/teams",
      "hooks_url": "https://api.github.com/repos/thisismudith/Uplift/hooks",
      "issue_events_url": "https://api.github.com/repos/thisismudith/Uplift/issues/events{/number}",
      "events_url": "https://api.github.com/repos/thisismudith/Uplift/events",
      "assignees_url": "https://api.github.com/repos/thisismudith/Uplift/assignees{/user}",
      "branches_url": "https://api.github.com/repos/thisismudith/Uplift/branches{/branch}",
      "tags_url": "https://api.github.com/repos/thisismudith/Uplift/tags",
      "blobs_url": "https://api.github.com/repos/thisismudith/Uplift/git/blobs{/sha}",
      "git_tags_url": "https://api.github.com/repos/thisismudith/Uplift/git/tags{/sha}",
      "git_refs_url": "https://api.github.com/repos/thisismudith/Uplift/git/refs{/sha}",
      "trees_url": "https://api.github.com/repos/thisismudith/Uplift/git/trees{/sha}",
      "statuses_url": "https://api.github.com/repos/thisismudith/Uplift/statuses/{sha}",
      "languages_url": "https://api.github.com/repos/thisismudith/Uplift/languages",
      "stargazers_url": "https://api.github.com/repos/thisismudith/Uplift/stargazers",
      "contributors_url": "https://api.github.com/repos/thisismudith/Uplift/contributors",
      "subscribers_url": "https://api.github.com/repos/thisismudith/Uplift/subscribers",
      "subscription_url": "https://api.github.com/repos/thisismudith/Uplift/subscription",
      "commits_url": "https://api.github.com/repos/thisismudith/Uplift/commits{/sha}",
      "git_commits_url": "https://api.github.com/repos/thisismudith/Uplift/git/commits{/sha}",
      "comments_url": "https://api.github.com/repos/thisismudith/Uplift/comments{/number}",
      "issue_comment_url": "https://api.github.com/repos/thisismudith/Uplift/issues/comments{/number}",
      "contents_url": "https://api.github.com/repos/thisismudith/Uplift/contents/{+path}",
      "compare_url": "https://api.github.com/repos/thisismudith/Uplift/compare/{base}...{head}",
      "merges_url": "https://api.github.com/repos/thisismudith/Uplift/merges",
      "archive_url": "https://api.github.com/repos/thisismudith/Uplift/{archive_format}{/ref}",
      "downloads_url": "https://api.github.com/repos/thisismudith/Uplift/downloads",
      "issues_url": "https://api.github.com/repos/thisismudith/Uplift/issues{/number}",
      "pulls_url": "https://api.github.com/repos/thisismudith/Uplift/pulls{/number}",
      "milestones_url": "https://api.github.com/repos/thisismudith/Uplift/milestones{/number}",
      "notifications_url": "https://api.github.com/repos/thisismudith/Uplift/notifications{?since,all,participating}",
      "labels_url": "https://api.github.com/repos/thisismudith/Uplift/labels{/name}",
      "releases_url": "https://api.github.com/repos/thisismudith/Uplift/releases{/id}",
      "deployments_url": "https://api.github.com/repos/thisismudith/Uplift/deployments",
      "created_at": "2023-02-01T20:19:51Z",
      "updated_at": "2023-02-01T20:19:59Z",
      "pushed_at": "2023-02-25T06:01:26Z",
      "git_url": "git://github.com/thisismudith/Uplift.git",
      "ssh_url": "git@github.com:thisismudith/Uplift.git",
      "clone_url": "https://github.com/thisismudith/Uplift.git",
      "svn_url": "https://github.com/thisismudith/Uplift",
      "homepage": null,
      "size": 82,
      "stargazers_count": 0,
      "watchers_count": 0,
      "language": "HTML",
      "has_issues": true,
      "has_projects": true,
      "has_downloads": true,
      "has_wiki": true,
      "has_pages": true,
      "has_discussions": false,
      "forks_count": 0,
      "mirror_url": null,
      "archived": false,
      "disabled": false,
      "open_issues_count": 0,
      "license": {
        "key": "mit",
        "name": "MIT License",
        "spdx_id": "MIT",
        "url": "https://api.github.com/licenses/mit",
        "node_id": "MDc6TGljZW5zZTEz"
      },
      "allow_forking": true,
      "is_template": false,
      "web_commit_signoff_required": false,
      "topics": [
  
      ],
      "visibility": "public",
      "forks": 0,
      "open_issues": 0,
      "watchers": 0,
      "default_branch": "main"
    }
  ]