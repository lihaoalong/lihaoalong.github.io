// 自建服务与个人博客管理应用 - 全自动同步版
class FullyAutoSyncManager {
    constructor() {
        this.links = this.loadLinks();
        this.blogPosts = this.loadBlogPosts();
        this.githubToken = localStorage.getItem('githubToken') || null;
        this.gistId = localStorage.getItem('gistId') || null;
        this.dataFilename = 'blog_data.json';
        
        this.init();
    }

    init() {
        this.renderLinks();
        this.renderBlogPosts();
        this.updateTokenDisplay();
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

    // 更新Token显示
    updateTokenDisplay() {
        const tokenInput = document.getElementById('githubToken');
        if (this.githubToken) {
            tokenInput.value = '••••••••'; // 隐藏显示
        }
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

        // Token设置事件
        document.getElementById('setToken').addEventListener('click', () => {
            this.setToken();
        });

        // 数据同步事件
        document.getElementById('syncRemoteData').addEventListener('click', () => {
            this.loadRemoteData();
        });

        document.getElementById('saveRemoteData').addEventListener('click', () => {
            this.saveRemoteData();
        });
    }

    // 设置GitHub Token
    setToken() {
        const tokenInput = document.getElementById('githubToken');
        const token = tokenInput.value.trim();
        
        if (token && token !== '••••••••') { // 避免设置隐藏显示的值
            this.githubToken = token;
            localStorage.setItem('githubToken', token);
            this.showMessage('Token已保存', 'success');
        } else if (!token) {
            this.githubToken = null;
            localStorage.removeItem('githubToken');
            this.showMessage('Token已清除', 'info');
        }
        
        this.updateTokenDisplay();
    }

    // 显示消息
    showMessage(message, type = 'info') {
        document.getElementById('statusText').textContent = message;
        
        const indicator = document.getElementById('statusIndicator');
        indicator.className = `status-indicator ${type}`;
        
        // 3秒后重置状态
        setTimeout(() => {
            document.getElementById('statusText').textContent = '就绪';
            indicator.className = 'status-indicator ready';
        }, 3000);
    }

    // 保存数据到远程（全自动）
    async saveRemoteData() {
        if (!this.githubToken) {
            this.showMessage('请先设置GitHub Token', 'error');
            return;
        }

        this.showMessage('正在保存到云端...', 'loading');

        try {
            const data = {
                links: this.links,
                blogPosts: this.blogPosts,
                timestamp: new Date().toISOString()
            };

            let gistData = {
                description: '自建服务与博客备忘录数据',
                public: false,
                files: {}
            };
            gistData.files[this.dataFilename] = {
                content: JSON.stringify(data, null, 2)
            };

            let response;
            if (this.gistId) {
                // 更新现有Gist
                response = await fetch(`https://api.github.com/gists/${this.gistId}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `token ${this.githubToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(gistData)
                });
            } else {
                // 创建新Gist
                response = await fetch('https://api.github.com/gists', {
                    method: 'POST',
                    headers: {
                        'Authorization': `token ${this.githubToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(gistData)
                });
            }

            if (response.ok) {
                const result = await response.json();
                this.gistId = result.id;
                localStorage.setItem('gistId', this.gistId);
                
                this.showMessage('数据已保存到云端！', 'success');
            } else {
                const error = await response.json();
                console.error('保存失败:', error);
                this.showMessage(`保存失败: ${error.message || '未知错误'}`, 'error');
            }
        } catch (error) {
            console.error('保存数据时出错:', error);
            this.showMessage(`保存失败: ${error.message}`, 'error');
        }
    }

    // 从远程加载数据（全自动）
    async loadRemoteData() {
        if (!this.githubToken) {
            this.showMessage('请先设置GitHub Token', 'error');
            return;
        }

        if (!this.gistId) {
            this.showMessage('请先输入Gist ID或保存一次数据', 'error');
            return;
        }

        this.showMessage('正在从云端加载...', 'loading');

        try {
            const response = await fetch(`https://api.github.com/gists/${this.gistId}`, {
                headers: {
                    'Authorization': `token ${this.githubToken}`
                }
            });

            if (response.ok) {
                const gist = await response.json();
                const fileContent = gist.files[this.dataFilename];
                
                if (fileContent && fileContent.content) {
                    const data = JSON.parse(fileContent.content);
                    
                    if (data.links && data.blogPosts) {
                        this.links = data.links;
                        this.blogPosts = data.blogPosts;
                        this.saveLinks();
                        this.saveBlogPosts();
                        this.renderLinks();
                        this.renderBlogPosts();
                        
                        this.showMessage('数据加载成功！', 'success');
                    } else {
                        this.showMessage('远程数据格式不正确', 'error');
                    }
                } else {
                    this.showMessage('未找到数据文件', 'error');
                }
            } else {
                const error = await response.json();
                console.error('加载失败:', error);
                this.showMessage(`加载失败: ${error.message || '未知错误'}`, 'error');
            }
        } catch (error) {
            console.error('加载数据时出错:', error);
            this.showMessage(`加载失败: ${error.message}`, 'error');
        }
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
                        <button class="edit-btn" onclick="fullyAutoSyncManager.editLink(${link.id})">编辑</button>
                        <button class="delete-btn" onclick="fullyAutoSyncManager.deleteLink(${link.id})">删除</button>
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
                    <button onclick="fullyAutoSyncManager.saveEdit(${link.id})">保存</button>
                    <button type="button" onclick="fullyAutoSyncManager.cancelEdit(${link.id})">取消</button>
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
                            <button class="edit-btn" onclick="fullyAutoSyncManager.editBlogPost(${post.id})">编辑</button>
                            <button class="delete-btn" onclick="fullyAutoSyncManager.deleteBlogPost(${post.id})">删除</button>
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
                        <button class="edit-btn" onclick="fullyAutoSyncManager.saveEditBlogPost(${post.id})">保存</button>
                        <button class="delete-btn" onclick="fullyAutoSyncManager.cancelEditBlogPost(${post.id})">取消</button>
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
let fullyAutoSyncManager;
document.addEventListener('DOMContentLoaded', () => {
    fullyAutoSyncManager = new FullyAutoSyncManager();
});