require 'spec_helper'

tag = ARGV.detect{|arg| arg.start_with?('--tag')}.split('=').last
tag_desc = tag.split(' ')
root_dir, overwrite = [tag_desc.first, tag_desc.include?('--overwrite')]

feature 'Capybara example', :"#{tag}" => true do
  scenario 'Test example' do
    script = File.read('./tree.js')

    Dir[root_dir + '/**/'].each do |dir|
      Dir[dir + '*htm*'].each do |path|
        begin
          if path =~ /\.[m]*htm[l]*$/
            visit "file://" + path
            tree = page.evaluate_script(script)

            ext = File.extname(path)
            filename = File.basename(path, ext)
            filename = filename + '_tree' unless filename === 'data'
            filename = filename + '.json'

            if !File.exists?(dir + filename) || overwrite
              file = File.open(dir + filename, "w")
              file.puts tree
              file.close
            end
          end
        rescue
          puts "Cannot read: " + path
          next
        end
      end
    end
  end
end
