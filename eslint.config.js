import pluginVue from 'eslint-plugin-vue'
export default [
  // add more generic rulesets here, such as:
  ...pluginVue.configs['flat/recommended'],
  {
    rules: {
      // override/add rules settings here, such as:
      // 'vue/no-unused-vars': 'error'
      
      'vue/prop-name-casing': 'off',
      'vue/require-v-for-key': 'off',
      'vue/multi-word-component-names': 'off', 
      'vue/no-duplicate-attributes': 'off', // this mignt cause huge effect to project. hope to be remove in future
      'vue/html-indent': 'off', // this might conflict with prettier
      'vue/attribute-hyphenation': 'off', // this might conflict with 'vue/prop-name-casing'
      'vue/max-attributes-per-line': 'off', // this might conflict with prettier
      'vue/html-self-closing': 'off', // this might conflict with prettier
      'vue/singleline-html-element-content-newline': 'off', // this might conflict with prettier
    }
  }
]