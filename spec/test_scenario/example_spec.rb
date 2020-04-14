require 'spec_helper'

dir = ARGV[1].split("=").last

feature 'Capybara example', :"#{dir}" => true do
  scenario 'Test example' do
    script = File.read('./tree.js')

    Dir[dir + '/*.html'].each do |path|
      visit "file://" + path
      page.execute_script(script)
      sleep 1
    end
  end
end
