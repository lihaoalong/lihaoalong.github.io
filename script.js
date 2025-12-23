// 自建服务链接管理应用
class LinkManager {
    constructor() {
        this.links = this.loadLinks();
        this.init();
    }

    init() {
        this.renderLinks();
        this.bindEvents();
    }

    // 加载本地存储的链接
    loadLinks() {
        const savedLinks = localStorage.getItem('serviceLinks');
        return savedLinks ? JSON.parse(savedLinks) : this.getDefaultLinks();
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
                        <button class="edit-btn" onclick="linkManager.editLink(${link.id})">编辑</button>
                        <button class="delete-btn" onclick="linkManager.deleteLink(${link.id})">删除</button>
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
                    <button onclick="linkManager.saveEdit(${link.id})">保存</button>
                    <button type="button" onclick="linkManager.cancelEdit(${link.id})">取消</button>
                </div>
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
        const form = document.getElementById('linkForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addLink();
        });
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

    // 删除链接
    deleteLink(id) {
        if (confirm('确定要删除这个链接吗？')) {
            this.links = this.links.filter(link => link.id !== id);
            this.saveLinks();
            this.renderLinks();
        }
    }

    // 编辑链接 - 显示编辑表单
    editLink(id) {
        // 隐藏所有编辑表单
        document.querySelectorAll('.edit-form').forEach(form => {
            form.style.display = 'none';
        });

        const editForm = document.getElementById(`edit-form-${id}`);
        if (editForm) {
            editForm.style.display = 'block';
        }
    }

    // 取消编辑
    cancelEdit(id) {
        const editForm = document.getElementById(`edit-form-${id}`);
        if (editForm) {
            editForm.style.display = 'none';
        }
    }

    // 保存编辑
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
let linkManager;
document.addEventListener('DOMContentLoaded', () => {
    linkManager = new LinkManager();
});