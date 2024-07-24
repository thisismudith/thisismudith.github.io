const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(obj =>{
        if (obj.isIntersecting){
            var animation = obj.target.getAttribute('animation');
            var exec = obj.target.getAttribute('exec')
            if (exec) eval(exec);
            var responsive = obj.target.getAttribute('animate-responsive');
            if (responsive){
                var [target, conditions] = responsive.split(' > ');
                conditions = conditions.split(',')
                for (i of conditions){
                    if (i.split('-')[0] > window.innerWidth){
                        animation = animation.replace(target,i.split('-')[1])
                    }
                }
            }
            obj.target.style.animation = animation;
            
        }
    });
})

var page = document.querySelectorAll("[animation], [exec]");
for (key of page){
    observer.observe(key)
}