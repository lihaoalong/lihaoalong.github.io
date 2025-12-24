// 自建服务与个人博客管理应用
class CombinedManager {
    constructor() {
        this.links = this.loadLinks();
        this.blogPosts = this.loadBlogPosts();
        this.init();
    }

    init() {
        this.renderLinks();
        this.renderBlogPosts();
        this.bindEvents();
    }

    // 加载本地存储的链接
    loadLinks() {
        const savedLinks = localStorage.getItem('serviceLinks');
        return savedLinks ? JSON.parse(savedLinks) : this.getDefaultLinks();
    }

    // 加载本地存储的博客文章
    loadBlogPosts() {
        const savedPosts = localStorage.getItem('blogPosts');
        return savedPosts ? JSON.parse(savedPosts) : [];
    }

    // 获取默认链接（从原始txt文件中提取）
    getDefaultLinks() {
        return [
            { id: 1, name: 'xui 节点', url: 'https://152.69.231.38:54322/09f/xui/', remark: 'xui节点地址1' },
            { id: 2, name: 'xui 节点', url: 'https://lihaoalong.top:54322/09f/xui/', remark: 'xui节点地址2' },
            { id: 3, name: 'xui 节点', url: 'https://158.180.82.83:54322/09f/xui/', remark: 'xui节点地址3' },
            { id: 4, name: '1panel面板', url: 'http://158.180.82.83:24882/alonglihao', remark: '1panel面板地址1' },
            { id: 5, name: '1panel面板', url: 'http://152.69.231.38:28560/alonglihao', remark: '1panel面板地址2' },
            { id: 6, name: 'Cloudflare', url: 'https://dash.cloudflare.com/0d4e7ec8269b1df4288f7e6430e534d3/lihaoalong.asia', remark: 'Cloudflare管理面板' },
            { id: 7, name: '优选IP', url: 'https://lihaoalong.dpdns.org/ADMIN', remark: '优选IP管理' },
            { id: 8, name: '饭太硬TV', url: 'http://www.饭太硬.com/tv', remark: '饭太硬TV源' },
            { id: 9, name: 'OK影视', url: 'http://ok321.top/tv', remark: 'OK影视TV源' }
        ];
    }

    // 保存链接到本地存储
    saveLinks() {
        localStorage.setItem('serviceLinks', JSON.stringify(this.links));
    }

    // 保存博客文章到本地存储
    saveBlogPosts() {
        localStorage.setItem('blogPosts', JSON.stringify(this.blogPosts));
    }

    // 渲染链接列表
    renderLinks() {
        const container = document.getElementById('linksContainer');
        
        if (this.links.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>暂无链接</h3>
                    <p>添加一些服务链接以便管理</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.links.map(link => `
            <div class="link-item" data-id="${link.id}">
                <div class="link-header">
                    <div class="link-name">${this.escapeHtml(link.name)}</div>
                    <div class="link-actions">
                        <button class="edit-btn" onclick="combinedManager.editLink(${link.id})">编辑</button>
                        <button class="delete-btn" onclick="combinedManager.deleteLink(${link.id})">删除</button>
                    </div>
                </div>
                <a href="${this.escapeHtml(link.url)}" target="_blank" class="link-url">${this.escapeHtml(link.url)}</a>
                ${link.remark ? `<div class="link-remark">${this.escapeHtml(link.remark)}</div>` : ''}
                <div class="edit-form" id="edit-form-${link.id}" style="display: none;">
                    <div class="form-group">
                        <label>链接名称:</label>
                        <input type="text" class="edit-name" value="${this.escapeHtml(link.name)}">
                    </div>
                    <div class="form-group">
                        <label>链接地址:</label>
                        <input type="text" class="edit-url" value="${this.escapeHtml(link.url)}">
                    </div>
                    <div class="form-group">
                        <label>备注:</label>
                        <textarea class="edit-remark">${this.escapeHtml(link.remark || '')}</textarea>
                    </div>
                    <button onclick="combinedManager.saveEdit(${link.id})">保存</button>
                    <button type="button" onclick="combinedManager.cancelEdit(${link.id})">取消</button>
                </div>
            </div>
        `).join('');
    }

    // 渲染博客文章列表
    renderBlogPosts() {
        const container = document.getElementById('blogPostsContainer');
        
        if (this.blogPosts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>暂无备忘录</h3>
                    <p>发布一些备忘录记录重要信息</p>
                </div>
            `;
            return;
        }

        // 按时间倒序排列（最新的在前）
        const sortedPosts = [...this.blogPosts].sort((a, b) => b.timestamp - a.timestamp);

        container.innerHTML = sortedPosts.map(post => `
            <div class="blog-post" data-id="${post.id}">
                <div class="blog-header">
                    <div class="blog-title">${this.escapeHtml(post.title)}</div>
                    <div class="blog-meta">
                        <span class="blog-category">${this.escapeHtml(post.category)}</span>
                        <span class="blog-date">${new Date(post.timestamp).toLocaleString('zh-CN')}</span>
                        <div class="blog-actions">
                            <button class="edit-btn" onclick="combinedManager.editBlogPost(${post.id})">编辑</button>
                            <button class="delete-btn" onclick="combinedManager.deleteBlogPost(${post.id})">删除</button>
                        </div>
                    </div>
                </div>
                <div class="blog-content">${this.escapeHtml(post.content).replace(/\n/g, '<br>')}</div>
            </div>
        `).join('');
    }

    // 转义HTML以防止XSS
    escapeHtml(text) {
        if (typeof text !== 'string') {
            return text;
        }
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    // 绑定事件
    bindEvents() {
        // 博客表单提交事件
        const blogForm = document.getElementById('blogForm');
        blogForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addBlogPost();
        });

        // 链接表单提交事件
        const linkForm = document.getElementById('linkForm');
        linkForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addLink();
        });
    }

    // 添加博客文章
    addBlogPost() {
        const titleInput = document.getElementById('blogTitle');
        const contentInput = document.getElementById('blogContent');
        const categoryInput = document.getElementById('blogCategory');

        const title = titleInput.value.trim();
        const content = contentInput.value.trim();
        const category = categoryInput.value;

        if (!title || !content) {
            alert('请填写标题和内容');
            return;
        }

        const newPost = {
            id: Date.now(), // 使用时间戳作为唯一ID
            title: title,
            content: content,
            category: category,
            timestamp: Date.now()
        };

        this.blogPosts.push(newPost);
        this.saveBlogPosts();
        this.renderBlogPosts();

        // 重置表单
        titleInput.value = '';
        contentInput.value = '';
        categoryInput.value = '工作';
    }

    // 添加新链接
    addLink() {
        const nameInput = document.getElementById('linkName');
        const urlInput = document.getElementById('linkUrl');
        const remarkInput = document.getElementById('linkRemark');

        const name = nameInput.value.trim();
        const url = urlInput.value.trim();
        const remark = remarkInput.value.trim();

        if (!name || !url) {
            alert('请填写链接名称和地址');
            return;
        }

        // 验证URL格式
        try {
            new URL(url);
        } catch (e) {
            alert('请输入有效的链接地址');
            return;
        }

        const newLink = {
            id: Date.now(), // 使用时间戳作为唯一ID
            name: name,
            url: url,
            remark: remark
        };

        this.links.push(newLink);
        this.saveLinks();
        this.renderLinks();

        // 重置表单
        nameInput.value = '';
        urlInput.value = '';
        remarkInput.value = '';
    }

    // 删除博客文章
    deleteBlogPost(id) {
        if (confirm('确定要删除这篇备忘录吗？')) {
            this.blogPosts = this.blogPosts.filter(post => post.id !== id);
            this.saveBlogPosts();
            this.renderBlogPosts();
        }
    }

    // 删除链接
    deleteLink(id) {
        if (confirm('确定要删除这个链接吗？')) {
            this.links = this.links.filter(link => link.id !== id);
            this.saveLinks();
            this.renderLinks();
        }
    }

    // 编辑博客文章 - 显示编辑表单
    editBlogPost(id) {
        // 获取原始文章
        const post = this.blogPosts.find(p => p.id === id);
        if (!post) return;

        // 用编辑表单替换文章显示
        const postElement = document.querySelector(`.blog-post[data-id="${id}"]`);
        if (!postElement) return;

        postElement.innerHTML = `
            <div class="blog-header">
                <div class="blog-title">编辑备忘录</div>
                <div class="blog-meta">
                    <div class="blog-actions">
                        <button class="edit-btn" onclick="combinedManager.saveEditBlogPost(${post.id})">保存</button>
                        <button class="delete-btn" onclick="combinedManager.cancelEditBlogPost(${post.id})">取消</button>
                    </div>
                </div>
            </div>
            <div class="edit-form">
                <div class="form-group">
                    <label>标题:</label>
                    <input type="text" class="edit-blog-title" value="${this.escapeHtml(post.title)}">
                </div>
                <div class="form-group">
                    <label>内容:</label>
                    <textarea class="edit-blog-content">${this.escapeHtml(post.content)}</textarea>
                </div>
                <div class="form-group">
                    <label>分类:</label>
                    <select class="edit-blog-category">
                        <option value="工作" ${post.category === '工作' ? 'selected' : ''}>工作</option>
                        <option value="生活" ${post.category === '生活' ? 'selected' : ''}>生活</option>
                        <option value="技术" ${post.category === '技术' ? 'selected' : ''}>技术</option>
                        <option value="学习" ${post.category === '学习' ? 'selected' : ''}>学习</option>
                        <option value="其他" ${post.category === '其他' ? 'selected' : ''}>其他</option>
                    </select>
                </div>
            </div>
        `;
    }

    // 取消编辑博客文章
    cancelEditBlogPost(id) {
        this.renderBlogPosts(); // 重新渲染以恢复原始状态
    }

    // 保存编辑的博客文章
    saveEditBlogPost(id) {
        const postElement = document.querySelector(`.blog-post[data-id="${id}"]`);
        if (!postElement) return;

        const titleInput = postElement.querySelector('.edit-blog-title');
        const contentInput = postElement.querySelector('.edit-blog-content');
        const categoryInput = postElement.querySelector('.edit-blog-category');

        const title = titleInput.value.trim();
        const content = contentInput.value.trim();
        const category = categoryInput.value;

        if (!title || !content) {
            alert('请填写标题和内容');
            return;
        }

        const postIndex = this.blogPosts.findIndex(post => post.id === id);
        if (postIndex !== -1) {
            this.blogPosts[postIndex].title = title;
            this.blogPosts[postIndex].content = content;
            this.blogPosts[postIndex].category = category;
            
            this.saveBlogPosts();
            this.renderBlogPosts();
        }
    }

    // 编辑链接 - 显示编辑表单
    editLink(id) {
        // 隐藏所有编辑表单
        document.querySelectorAll('.edit-form').forEach(form => {
            if(form.id && form.id.startsWith('edit-form-')) {
                form.style.display = 'none';
            }
        });

        const editForm = document.getElementById(`edit-form-${id}`);
        if (editForm) {
            editForm.style.display = 'block';
        }
    }

    // 取消编辑链接
    cancelEdit(id) {
        const editForm = document.getElementById(`edit-form-${id}`);
        if (editForm) {
            editForm.style.display = 'none';
        }
    }

    // 保存编辑链接
    saveEdit(id) {
        const linkItem = document.querySelector(`.link-item[data-id="${id}"]`);
        if (!linkItem) return;

        const nameInput = linkItem.querySelector('.edit-name');
        const urlInput = linkItem.querySelector('.edit-url');
        const remarkInput = linkItem.querySelector('.edit-remark');

        const name = nameInput.value.trim();
        const url = urlInput.value.trim();
        const remark = remarkInput.value.trim();

        if (!name || !url) {
            alert('请填写链接名称和地址');
            return;
        }

        // 验证URL格式
        try {
            new URL(url);
        } catch (e) {
            alert('请输入有效的链接地址');
            return;
        }

        const linkIndex = this.links.findIndex(link => link.id === id);
        if (linkIndex !== -1) {
            this.links[linkIndex].name = name;
            this.links[linkIndex].url = url;
            this.links[linkIndex].remark = remark;
            
            this.saveLinks();
            this.renderLinks();
        }
    }
}

// 初始化应用
let combinedManager;
document.addEventListener('DOMContentLoaded', () => {
    combinedManager = new CombinedManager();
});